/**
 * Centralized Time Service
 * 
 * Handelt alle tijd-gerelateerde logica af voor de app.
 * Vervangt de verspreidde tijd-logica met een centrale service.
 */

export interface TimeConfig {
  reflectionStartHour: number; // 20
  reflectionEndHour: number;   // 6
  nightModeStartHour: number;  // 0
  nightModeEndHour: number;    // 6
  systemTimeOffset: number;    // 0 (in dagen)
}

export type TimeCategory = 'morning' | 'day' | 'evening' | 'night';
export type ReflectionUrgency = 'none' | 'upcoming' | 'active' | 'urgent' | 'critical';

class TimeService {
  private static config: TimeConfig = {
    reflectionStartHour: 20,
    reflectionEndHour: 6,
    nightModeStartHour: 0,
    nightModeEndHour: 6,
    systemTimeOffset: 0 // Configureerbare datum offset (0 = geen offset)
  };

  /**
   * Configuratie ophalen/instellen
   */
  static getConfig(): TimeConfig {
    // Voor React Native gebruiken we hier gewoon de default config
    // AsyncStorage calls moeten async zijn, dus we gebruiken hier de fallback
    return this.config;
  }

  static updateConfig(newConfig: Partial<TimeConfig>): void {
    // Voor nu gewoon de in-memory config updaten
    // Later kunnen we dit uitbreiden met AsyncStorage
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Basis tijd functies
   */
  static getRawCurrentDate(): string {
    // Echte systeem datum zonder offset
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  static getCurrentDate(): string {
    const now = new Date();
    const config = this.getConfig();
    now.setDate(now.getDate() + config.systemTimeOffset);
    return now.toISOString().split('T')[0];
  }

  static getCurrentHour(): number {
    return new Date().getHours();
  }

  static getDateMinusDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  /**
   * Tijd categorieën
   */
  static getTimeCategory(): TimeCategory {
    const hour = this.getCurrentHour();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'day';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  static isReflectionTime(): boolean {
    const hour = this.getCurrentHour();
    const config = this.getConfig();
    
    // Handle cross-midnight time range (e.g., 20:00-06:00)
    if (config.reflectionStartHour > config.reflectionEndHour) {
      return hour >= config.reflectionStartHour || hour < config.reflectionEndHour;
    }
    
    return hour >= config.reflectionStartHour && hour < config.reflectionEndHour;
  }

  static isNightMode(): boolean {
    const hour = this.getCurrentHour();
    const config = this.getConfig();
    
    if (config.nightModeStartHour > config.nightModeEndHour) {
      return hour >= config.nightModeStartHour || hour < config.nightModeEndHour;
    }
    
    return hour >= config.nightModeStartHour && hour < config.nightModeEndHour;
  }

  static isAlmostReflectionTime(): boolean {
    const hour = this.getCurrentHour();
    const config = this.getConfig();
    return hour === config.reflectionStartHour - 1;
  }

  /**
   * Smart date logica
   */
  static getSmartTodayDate(dataService: any): string {
    // Vereenvoudigde versie voor React Native - async storage is te complex voor sync gebruik
    // Gebruik gewoon de huidige kalenderdag voor nu
    const rawCurrentDate = this.getRawCurrentDate();
    const config = this.getConfig();
    
    // Pas de systeem offset toe op de basis datum
    const baseDate = new Date(rawCurrentDate);
    baseDate.setDate(baseDate.getDate() + config.systemTimeOffset);
    const currentCalendarDate = baseDate.toISOString().split('T')[0];
    
    const currentHour = this.getCurrentHour();

    // Als het na night mode is, gebruik gewoon de huidige kalenderdag
    if (currentHour >= config.nightModeEndHour) {
      return currentCalendarDate;
    }

    // Voor night mode: gebruik ook gewoon de huidige kalenderdag
    // TODO: Later uitbreiden met async support voor complexere logica
    return currentCalendarDate;
  }

  /**
   * Unreflected days analysis
   */
  static getUnreflectedDays(dataService: any, maxDaysBack: number = 3): string[] {
    const currentDate = this.getCurrentDate();
    const unreflectedDays: string[] = [];

    for (let i = 1; i <= maxDaysBack; i++) { // Skip today (i=0)
      const checkDate = this.getDateMinusDays(currentDate, i);
      const dayPlan = dataService.getDayPlan(checkDate);
      const dayReflection = dataService.getReflection(checkDate);

      if (dayPlan && dayPlan.goals.length > 0 && !dayReflection) {
        unreflectedDays.push(checkDate);
      }
    }

    return unreflectedDays;
  }

  static hasUnreflectedDays(dataService: any): boolean {
    return this.getUnreflectedDays(dataService).length > 0;
  }

  /**
   * Reflection urgency calculation
   */
  static getReflectionUrgency(dataService: any): ReflectionUrgency {
    const unreflectedDays = this.getUnreflectedDays(dataService);
    
    if (unreflectedDays.length === 0) {
      return 'none';
    }

    const isReflectionTime = this.isReflectionTime();
    const timeCategory = this.getTimeCategory();
    const daysCount = unreflectedDays.length;

    // Critical: Multiple days unreflected + night time
    if (daysCount >= 2 && timeCategory === 'night') {
      return 'critical';
    }

    // Urgent: Reflection time + unreflected days
    if (isReflectionTime && daysCount >= 1) {
      return 'urgent';
    }

    // Active: Reflection time but manageable
    if (isReflectionTime) {
      return 'active';
    }

    // Upcoming: Almost reflection time
    if (this.isAlmostReflectionTime()) {
      return 'upcoming';
    }

    return 'none';
  }

  /**
   * CTA mode determination
   */
  static getCTAMode(dataService: any): 'hidden' | 'subtle' | 'normal' | 'prominent' | 'urgent' {
    const urgency = this.getReflectionUrgency(dataService);
    
    switch (urgency) {
      case 'critical':
        return 'urgent';
      case 'urgent':
        return 'prominent';
      case 'active':
        return 'normal';
      case 'upcoming':
        return 'normal';
      case 'none':
        return 'subtle';
      default:
        return 'hidden';
    }
  }

  /**
   * Message generation
   */
  static getReflectionMessage(dataService: any, totalGoals: number, completedGoals: number): string {
    const urgency = this.getReflectionUrgency(dataService);
    const unreflectedDays = this.getUnreflectedDays(dataService);
    const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    const hasReflection = !!dataService.getReflection(this.getSmartTodayDate(dataService));
    
    if (hasReflection) {
      return `Je hebt al gereflecteerd op vandaag (${completionPercentage}% voltooid). Je kunt je reflectie bekijken of bewerken.`;
    }

    switch (urgency) {
      case 'critical':
        return `Urgent! Je hebt ${unreflectedDays.length} dagen niet gereflecteerd. Sluit deze af voordat je gaat slapen.`;
      case 'urgent':
        return `Het is laat! Reflecteer op je dag (${completionPercentage}% voltooid) voordat je gaat slapen.`;
      case 'active':
        return `De avond is begonnen - reflecteer op je dag met ${completionPercentage}% voltooiing.`;
      case 'upcoming':
        return `De avond komt eraan - bereid je voor op reflectie (${completionPercentage}% voltooid).`;
      default:
        return "Later vandaag kun je reflecteren op je dag.";
    }
  }

  /**
   * Debug info
   */
  static getDebugInfo(dataService: any): object {
    return {
      currentDate: this.getCurrentDate(),
      currentHour: this.getCurrentHour(),
      timeCategory: this.getTimeCategory(),
      isReflectionTime: this.isReflectionTime(),
      isNightMode: this.isNightMode(),
      smartTodayDate: this.getSmartTodayDate(dataService),
      unreflectedDays: this.getUnreflectedDays(dataService),
      reflectionUrgency: this.getReflectionUrgency(dataService),
      ctaMode: this.getCTAMode(dataService),
      config: this.getConfig()
    };
  }
}

export default TimeService;
