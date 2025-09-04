import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimeService from '../../lib/time-service';
import { DataService } from '../../lib/data-service';

interface DebugPanelProps {
  todayDate?: string;
}

// Console interceptor for capturing logs
class ConsoleCapture {
  private static logs: Array<{ timestamp: string; level: string; message: string }> = [];
  private static maxLogs = 50;
  
  static init() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = (...args) => {
      this.addLog('log', args.join(' '));
      originalLog.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.addLog('warn', args.join(' '));
      originalWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      this.addLog('error', args.join(' '));
      originalError.apply(console, args);
    };
  }
  
  private static addLog(level: string, message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push({ timestamp, level, message });
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }
  
  static getLogs() {
    return this.logs.slice();
  }
  
  static getSmartDateLogs() {
    return this.logs.filter(log => 
      log.message.includes('🔍') || 
      log.message.includes('📅') || 
      log.message.includes('🕐') ||
      log.message.includes('☀️') ||
      log.message.includes('🌙') ||
      log.message.includes('✅') ||
      log.message.includes('⏪') ||
      log.message.includes('📋')
    );
  }
  
  static clearLogs() {
    this.logs = [];
  }
}

// Initialize console capture
ConsoleCapture.init();

interface DebugPanelProps {
  todayDate?: string;
}

export function DebugPanel({ todayDate }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  const loadDebugInfo = async () => {
    try {
      const asyncDebugInfo = await TimeService.getDebugInfoAsync(DataService);
      const syncDebugInfo = TimeService.getDebugInfo(DataService);
      
      setDebugInfo({
        async: asyncDebugInfo,
        sync: syncDebugInfo,
        hookTodayDate: todayDate,
        timestamp: new Date().toLocaleTimeString(),
        logs: ConsoleCapture.getSmartDateLogs(),
        allLogs: ConsoleCapture.getLogs()
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadDebugInfo();
    }
  }, [isVisible, todayDate]);

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const getStatusColor = (value: boolean) => {
    return value ? '#10B981' : '#EF4444';
  };

  return (
    <>
      {/* Debug Toggle Button */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="bug-outline" size={16} color="#6B7280" />
        <Text style={styles.debugButtonText}>Debug</Text>
      </TouchableOpacity>

      {/* Debug Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔍 Debug Informatie</Text>
            <View style={styles.headerControls}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  ConsoleCapture.clearLogs();
                  Alert.alert('Logs Cleared', 'Console logs have been cleared');
                  loadDebugInfo();
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
              onPress={() => setActiveTab('logs')}
            >
              <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
                Logs ({debugInfo?.logs?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer}>
            {debugInfo && (
              <View style={styles.debugContent}>
                {activeTab === 'overview' && (
                  <>
                    {/* Quick Overview */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>📊 Quick Overview</Text>
                      <View style={styles.overviewGrid}>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>Hook Today Date</Text>
                          <Text style={[styles.overviewValue, { color: '#3B82F6' }]}>
                            {debugInfo.hookTodayDate}
                          </Text>
                        </View>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>Real System Date</Text>
                          <Text style={[styles.overviewValue, { color: '#059669' }]}>
                            {debugInfo.async.rawCurrentDate}
                          </Text>
                        </View>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>Adjusted Date (with offset)</Text>
                          <Text style={[styles.overviewValue, { color: debugInfo.async.config.systemTimeOffset !== 0 ? '#DC2626' : '#059669' }]}>
                            {debugInfo.async.currentDate}
                          </Text>
                        </View>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>Smart Date</Text>
                          <Text style={[styles.overviewValue, { color: '#8B5CF6' }]}>
                            {debugInfo.async.smartTodayDate}
                          </Text>
                        </View>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>Real System Hour</Text>
                          <Text style={styles.overviewValue}>
                            {debugInfo.async.currentHour}:00
                          </Text>
                        </View>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>Adjusted Hour (used by app)</Text>
                          <Text style={[styles.overviewValue, { 
                            color: debugInfo.async.config.systemTimeOffset !== 0 ? '#DC2626' : '#6B7280',
                            fontWeight: debugInfo.async.config.systemTimeOffset !== 0 ? '800' : '600'
                          }]}>
                            {debugInfo.async.adjustedHour}:00
                          </Text>
                        </View>
                        <View style={styles.overviewItem}>
                          <Text style={styles.overviewLabel}>System Offset</Text>
                          <Text style={[styles.overviewValue, { 
                            color: debugInfo.async.config.systemTimeOffset !== 0 ? '#DC2626' : '#6B7280',
                            fontWeight: debugInfo.async.config.systemTimeOffset !== 0 ? '800' : '600'
                          }]}>
                            {debugInfo.async.config.systemTimeOffset} days
                          </Text>
                        </View>
                      </View>
                      
                      {debugInfo.async.config.systemTimeOffset !== 0 && (
                        <View style={styles.warningContainer}>
                          <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                          <Text style={styles.warningText}>
                            Time offset is active! System is showing {debugInfo.async.config.systemTimeOffset > 0 ? 'future' : 'past'} date.
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Time Status */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>⏰ Time Status</Text>
                      <View style={styles.statusGrid}>
                        <View style={styles.statusItem}>
                          <View style={[styles.statusDot, { backgroundColor: getStatusColor(debugInfo.async.isNightMode) }]} />
                          <Text style={styles.statusLabel}>Night Mode</Text>
                          <Text style={styles.statusValue}>{debugInfo.async.isNightMode ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <View style={[styles.statusDot, { backgroundColor: getStatusColor(debugInfo.async.isReflectionTime) }]} />
                          <Text style={styles.statusLabel}>Reflection Time</Text>
                          <Text style={styles.statusValue}>{debugInfo.async.isReflectionTime ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Text style={styles.statusLabel}>Time Category</Text>
                          <Text style={[styles.statusValue, { color: '#8B5CF6' }]}>{debugInfo.async.timeCategory}</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Text style={styles.statusLabel}>CTA Mode</Text>
                          <Text style={[styles.statusValue, { color: '#F59E0B' }]}>{debugInfo.async.ctaMode}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Unreflected Days */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>📝 Unreflected Days</Text>
                      {debugInfo.async.unreflectedDays.length > 0 ? (
                        <View style={styles.unreflectedContainer}>
                          {debugInfo.async.unreflectedDays.map((date: string, index: number) => (
                            <View key={index} style={styles.unreflectedItem}>
                              <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                              <Text style={styles.unreflectedDate}>{date}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.noUnreflectedText}>✅ No unreflected days</Text>
                      )}
                    </View>

                    {/* Configuration */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>⚙️ Configuration</Text>
                      <View style={styles.configGrid}>
                        <View style={styles.configItem}>
                          <Text style={styles.configLabel}>Reflection Hours</Text>
                          <Text style={styles.configValue}>
                            {debugInfo.async.config.reflectionStartHour}:00 - {debugInfo.async.config.reflectionEndHour}:00
                          </Text>
                        </View>
                        <View style={styles.configItem}>
                          <Text style={styles.configLabel}>Night Mode Hours</Text>
                          <Text style={styles.configValue}>
                            {debugInfo.async.config.nightModeStartHour}:00 - {debugInfo.async.config.nightModeEndHour}:00
                          </Text>
                        </View>
                        <View style={styles.configItem}>
                          <Text style={styles.configLabel}>System Offset</Text>
                          <Text style={styles.configValue}>
                            {debugInfo.async.config.systemTimeOffset} days
                          </Text>
                        </View>
                      </View>
                      
                      {/* Test Actions */}
                      <View style={styles.testActionsContainer}>
                        <Text style={styles.testActionsTitle}>🧪 Test Actions</Text>
                        <View style={styles.testButtonsGrid}>
                          <TouchableOpacity
                            style={[styles.testButton, { backgroundColor: '#FEF3C7' }]}
                            onPress={() => {
                              const currentOffset = TimeService.getConfig().systemTimeOffset;
                              Alert.alert(
                                'System Offset Info', 
                                `Current offset: ${currentOffset} days\nReal date: ${TimeService.getRawCurrentDate()}\nAdjusted date: ${TimeService.getCurrentDate()}`,
                                [{ text: 'OK' }]
                              );
                            }}
                          >
                            <Text style={[styles.testButtonText, { color: '#92400E' }]}>Check Current Offset</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.testButton, { backgroundColor: '#DCFCE7' }]}
                            onPress={() => {
                              TimeService.updateConfig({ systemTimeOffset: 0 });
                              loadDebugInfo();
                              Alert.alert('Time Reset', `Reset to real current date: ${TimeService.getRawCurrentDate()}`);
                            }}
                          >
                            <Text style={[styles.testButtonText, { color: '#166534' }]}>Reset to Real Today</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.testButton}
                            onPress={() => {
                              TimeService.updateConfig({ systemTimeOffset: -1 });
                              loadDebugInfo();
                              Alert.alert('Time Offset', 'Set to yesterday (-1 day)');
                            }}
                          >
                            <Text style={styles.testButtonText}>Go to Yesterday</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.testButton}
                            onPress={() => {
                              TimeService.updateConfig({ systemTimeOffset: 0 });
                              loadDebugInfo();
                              Alert.alert('Time Offset', 'Reset to current date');
                            }}
                          >
                            <Text style={styles.testButtonText}>Reset to Today</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.testButton}
                            onPress={() => {
                              TimeService.updateConfig({ systemTimeOffset: 1 });
                              loadDebugInfo();
                              Alert.alert('Time Offset', 'Set to tomorrow (+1 day)');
                            }}
                          >
                            <Text style={styles.testButtonText}>Go to Tomorrow</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.testButton, { backgroundColor: '#FEE2E2' }]}
                            onPress={() => {
                              const config = TimeService.getConfig();
                              const realHour = TimeService.getCurrentHour();
                              const adjustedHour = TimeService.getAdjustedHour();
                              const isNight = TimeService.isNightMode();
                              const isReflection = TimeService.isReflectionTime();
                              const timeCategory = TimeService.getTimeCategory();
                              
                              console.log('🧪 Time Logic Test:', {
                                realHour,
                                adjustedHour,
                                offset: config.systemTimeOffset,
                                isNight,
                                isReflection,
                                timeCategory
                              });
                              
                              Alert.alert(
                                'Time Logic Test', 
                                `Real Hour: ${realHour}:00\nAdjusted Hour: ${adjustedHour}:00\nOffset: ${config.systemTimeOffset} days\nNight Mode: ${isNight}\nReflection Time: ${isReflection}\nCategory: ${timeCategory}`,
                                [{ text: 'OK' }]
                              );
                            }}
                          >
                            <Text style={[styles.testButtonText, { color: '#DC2626' }]}>Test Time Logic</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Raw JSON */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🔧 Raw Debug Data</Text>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={loadDebugInfo}
                      >
                        <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                        <Text style={styles.refreshButtonText}>Refresh Data</Text>
                      </TouchableOpacity>
                      <View style={styles.jsonContainer}>
                        <Text style={styles.jsonText}>{formatJson(debugInfo)}</Text>
                      </View>
                    </View>
                  </>
                )}

                {activeTab === 'logs' && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Smart Date Logs</Text>
                    {debugInfo.logs && debugInfo.logs.length > 0 ? (
                      <ScrollView style={styles.logsContainer} nestedScrollEnabled>
                        {debugInfo.logs.map((log: any, index: number) => (
                          <View key={index} style={styles.logItem}>
                            <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                            <Text style={styles.logMessage}>{log.message}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={styles.noLogsText}>📝 No smart date logs captured yet. Trigger a refresh to see logs.</Text>
                    )}
                  </View>
                )}

                <Text style={styles.timestamp}>
                  Last updated: {debugInfo.timestamp}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    top: 12,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    gap: 4,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  debugContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusGrid: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  unreflectedContainer: {
    gap: 8,
  },
  unreflectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    gap: 8,
  },
  unreflectedDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  noUnreflectedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  configGrid: {
    gap: 8,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  configLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  jsonContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
  },
  jsonText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#F9FAFB',
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  
  // New styles for enhanced debug panel
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  logsContainer: {
    maxHeight: 300,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  logTimestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 12,
    color: '#1F2937',
    fontFamily: 'Courier',
    lineHeight: 16,
  },
  noLogsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  
  // Test action styles
  testActionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  testActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  testButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
  },
  
  // Warning styles
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
});
