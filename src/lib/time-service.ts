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
    // Echte systeem datum zonder offset - gebruik lokale tijd, niet UTC
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getCurrentDate(): string {
    const now = new Date();
    const config = this.getConfig();
    
    // Pas offset toe op de Date object
    now.setDate(now.getDate() + config.systemTimeOffset);
    
    // Gebruik lokale datum, niet UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const adjustedDate = `${year}-${month}-${day}`;
    
    // Debug log om te zien wat er gebeurt
    const rawDate = this.getRawCurrentDate();
    
    if (config.systemTimeOffset !== 0) {
      console.log('⚙️ getCurrentDate with offset:', {
        rawDate,
        systemTimeOffset: config.systemTimeOffset,
        adjustedDate,
        note: `Applied ${config.systemTimeOffset} day(s) offset`
      });
    }
    
    return adjustedDate;
  }

  static getCurrentHour(): number {
    return new Date().getHours();
  }

  static getAdjustedHour(): number {
    // Voor debugging en offset scenarios - gebruik de adjusted time
    const config = this.getConfig();
    if (config.systemTimeOffset !== 0) {
      const now = new Date();
      now.setDate(now.getDate() + config.systemTimeOffset);
      const adjustedHour = now.getHours(); // Dit gebruikt al lokale tijd
      console.log('🕐 getAdjustedHour with offset:', {
        realHour: this.getCurrentHour(),
        adjustedHour,
        offset: config.systemTimeOffset
      });
      return adjustedHour;
    }
    return this.getCurrentHour();
  }

  static getDateMinusDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    
    // Gebruik lokale datum, niet UTC
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Tijd categorieën
   */
  static getTimeCategory(): TimeCategory {
    const hour = this.getAdjustedHour();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'day';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  static isReflectionTime(): boolean {
    const hour = this.getAdjustedHour();
    const config = this.getConfig();
    
    // Handle cross-midnight time range (e.g., 20:00-06:00)
    if (config.reflectionStartHour > config.reflectionEndHour) {
      return hour >= config.reflectionStartHour || hour < config.reflectionEndHour;
    }
    
    return hour >= config.reflectionStartHour && hour < config.reflectionEndHour;
  }

  static isNightMode(): boolean {
    const hour = this.getAdjustedHour();
    const config = this.getConfig();
    
    if (config.nightModeStartHour > config.nightModeEndHour) {
      return hour >= config.nightModeStartHour || hour < config.nightModeEndHour;
    }
    
    return hour >= config.nightModeStartHour && hour < config.nightModeEndHour;
  }

  static isAlmostReflectionTime(): boolean {
    const hour = this.getAdjustedHour();
    const config = this.getConfig();
    return hour === config.reflectionStartHour - 1;
  }

  /**
   * Smart date logica
   */
  static async getSmartTodayDateAsync(dataService: any): Promise<string> {
    // Gebruik de echte basis datum voor smart logic
    const rawCurrentDate = this.getRawCurrentDate();
    const config = this.getConfig();
    
    // Pas de systeem offset toe op de basis datum
    const baseDate = new Date(rawCurrentDate);
    baseDate.setDate(baseDate.getDate() + config.systemTimeOffset);
    
    // Gebruik lokale datum, niet UTC
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const currentCalendarDate = `${year}-${month}-${day}`;
    
    const currentHour = this.getAdjustedHour();

    console.log('🕐 Smart Date Logic Start:', {
      rawCurrentDate,
      currentCalendarDate,
      currentHour,
      isNightMode: currentHour >= config.nightModeStartHour && currentHour < config.nightModeEndHour
    });

    // Als het NIET night mode is, gebruik gewoon de huidige kalenderdag
    if (currentHour < config.nightModeStartHour || currentHour >= config.nightModeEndHour) {
      console.log('☀️ Not in night mode - using current calendar date:', currentCalendarDate);
      return currentCalendarDate;
    }

    // Night mode logica (00:00-06:00)
    console.log('🌙 In night mode - checking for unreflected goals');
    const yesterdayDate = this.getDateMinusDays(currentCalendarDate, 1);
    
    const todayPlan = await dataService.getDayPlan(currentCalendarDate);
    const yesterdayPlan = await dataService.getDayPlan(yesterdayDate);

    console.log('🌙 Night mode logic:', {
      yesterdayDate,
      todayPlanExists: !!todayPlan,
      todayGoalsCount: todayPlan?.goals?.length || 0,
      yesterdayPlanExists: !!yesterdayPlan,
      yesterdayGoalsCount: yesterdayPlan?.goals?.length || 0
    });

    // PRIORITEIT 1: Blijf op gisteren als er doelen zijn zonder reflectie
    if (yesterdayPlan && yesterdayPlan.goals.length > 0) {
      const yesterdayReflection = await dataService.getReflection(yesterdayDate);
      console.log('🔍 Yesterday check (Priority 1):', {
        yesterdayDate,
        hasReflection: !!yesterdayReflection,
        goalsCount: yesterdayPlan.goals.length
      });
      
      if (!yesterdayReflection) {
        console.log('⏪ Priority 1: Yesterday has unreflected goals - staying on yesterday:', yesterdayDate);
        return yesterdayDate;
      } else {
        console.log('✅ Yesterday already reflected - can move to current date');
      }
    }

    // PRIORITEIT 2: Als er al doelen zijn voor vandaag EN gisteren is af
    if (todayPlan && todayPlan.goals.length > 0) {
      console.log('✅ Priority 2: Today has goals and yesterday is done - staying on current date:', currentCalendarDate);
      return currentCalendarDate;
    }

    console.log('📅 Default: Using current calendar date:', currentCalendarDate);
    return currentCalendarDate;
  }

  // Sync wrapper voor backwards compatibility (gebruikt cache/fallback)
  static getSmartTodayDate(dataService: any): string {
    // Voor nu gebruik gewoon de huidige datum - dit wordt later async
    const rawCurrentDate = this.getRawCurrentDate();
    const config = this.getConfig();
    
    const baseDate = new Date(rawCurrentDate);
    baseDate.setDate(baseDate.getDate() + config.systemTimeOffset);
    
    // Gebruik lokale datum, niet UTC
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Unreflected days analysis
   */
  static async getUnreflectedDaysAsync(dataService: any, maxDaysBack: number = 3): Promise<string[]> {
    const currentDate = this.getCurrentDate();
    const unreflectedDays: string[] = [];

    for (let i = 1; i <= maxDaysBack; i++) { // Skip today (i=0)
      const checkDate = this.getDateMinusDays(currentDate, i);
      const dayPlan = await dataService.getDayPlan(checkDate);
      const dayReflection = await dataService.getReflection(checkDate);

      if (dayPlan && dayPlan.goals.length > 0 && !dayReflection) {
        unreflectedDays.push(checkDate);
      }
    }

    return unreflectedDays;
  }

  static getUnreflectedDays(dataService: any, maxDaysBack: number = 3): string[] {
    // Sync fallback - retourneert lege array voor nu
    // In productie zou dit gecached data gebruiken
    console.log('Warning: Using sync version of getUnreflectedDays - use async version for accurate results');
    return [];
  }

  static async hasUnreflectedDaysAsync(dataService: any): Promise<boolean> {
    const unreflectedDays = await this.getUnreflectedDaysAsync(dataService);
    return unreflectedDays.length > 0;
  }

  static hasUnreflectedDays(dataService: any): boolean {
    // Sync fallback
    console.log('Warning: Using sync version of hasUnreflectedDays - use async version for accurate results');
    return false;
  }

  /**
   * Reflection urgency calculation
   */
  static async getReflectionUrgencyAsync(dataService: any): Promise<ReflectionUrgency> {
    const unreflectedDays = await this.getUnreflectedDaysAsync(dataService);
    
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
   * Reflection urgency calculation
   */
  static getReflectionUrgency(dataService: any): ReflectionUrgency {
    // Sync fallback
    console.log('Warning: Using sync version of getReflectionUrgency - use async version for accurate results');
    const isReflectionTime = this.isReflectionTime();
    const timeCategory = this.getTimeCategory();

    if (isReflectionTime && timeCategory === 'night') {
      return 'urgent';
    }

    if (isReflectionTime) {
      return 'active';
    }

    if (this.isAlmostReflectionTime()) {
      return 'upcoming';
    }

    return 'none';
  }

  /**
   * CTA mode determination
   */
  static async getCTAModeAsync(dataService: any): Promise<'hidden' | 'subtle' | 'normal' | 'prominent' | 'urgent'> {
    const urgency = await this.getReflectionUrgencyAsync(dataService);
    
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
  static async getReflectionMessageAsync(dataService: any, totalGoals: number, completedGoals: number): Promise<string> {
    const urgency = await this.getReflectionUrgencyAsync(dataService);
    const unreflectedDays = await this.getUnreflectedDaysAsync(dataService);
    const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    const smartToday = await this.getSmartTodayDateAsync(dataService);
    const hasReflection = !!(await dataService.getReflection(smartToday));
    
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
   * Message generation
   */
  static getReflectionMessage(dataService: any, totalGoals: number, completedGoals: number): string {
    const urgency = this.getReflectionUrgency(dataService);
    const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Sync fallback - kan geen reflectie status checken
    switch (urgency) {
      case 'critical':
        return `Het is laat! Reflecteer op je dag (${completionPercentage}% voltooid) voordat je gaat slapen.`;
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
  static async getDebugInfoAsync(dataService: any): Promise<object> {
    const smartTodayDate = await this.getSmartTodayDateAsync(dataService);
    const unreflectedDays = await this.getUnreflectedDaysAsync(dataService);
    const reflectionUrgency = await this.getReflectionUrgencyAsync(dataService);
    const ctaMode = await this.getCTAModeAsync(dataService);

    return {
      rawCurrentDate: this.getRawCurrentDate(),
      currentDate: this.getCurrentDate(),
      currentHour: this.getCurrentHour(),
      adjustedHour: this.getAdjustedHour(),
      timeCategory: this.getTimeCategory(),
      isReflectionTime: this.isReflectionTime(),
      isNightMode: this.isNightMode(),
      smartTodayDate,
      unreflectedDays,
      reflectionUrgency,
      ctaMode,
      config: this.getConfig()
    };
  }

  /**
   * Debug info
   */
  static getDebugInfo(dataService: any): object {
    return {
      rawCurrentDate: this.getRawCurrentDate(),
      currentDate: this.getCurrentDate(),
      currentHour: this.getCurrentHour(),
      adjustedHour: this.getAdjustedHour(),
      timeCategory: this.getTimeCategory(),
      isReflectionTime: this.isReflectionTime(),
      isNightMode: this.isNightMode(),
      smartTodayDate: this.getSmartTodayDate(dataService),
      unreflectedDays: [], // Sync version returns empty
      reflectionUrgency: this.getReflectionUrgency(dataService),
      ctaMode: this.getCTAMode(dataService),
      config: this.getConfig(),
      note: 'Use async versions for accurate unreflected days data'
    };
  }
}

export default TimeService;
