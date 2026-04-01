export const categoryTabs = ['ALL', 'WTS', 'EI', 'GC', 'HVAC'];

export const priorityOptions = [
  { label: 'P1', value: 'P1', color: 'red' },
  { label: 'P2', value: 'P2', color: 'orange' },
  { label: 'P3', value: 'P3', color: 'gold' },
  { label: 'P4', value: 'P4', color: 'blue' },
];

export const priorityColorMap = {
  P1: 'red',
  P2: 'orange',
  P3: 'gold',
  P4: 'blue',
};

export const alarmData = [
  { key: '1', time: '2026-03-28 14:32:15', site: 'A廠', category: 'WTS', section: 'I&C', tagName: 'WTS-TK-001-LVL', message: 'High Level Alarm', description: 'Tank level exceeded 95% threshold', priority: 'P1', count: 3 },
  { key: '2', time: '2026-03-28 14:15:42', site: 'A廠', category: 'EI', section: 'ELEC', tagName: 'EI-UPS-A01-BAT', message: 'Battery Low Voltage', description: 'UPS battery voltage below 44V', priority: 'P1', count: 1 },
  { key: '3', time: '2026-03-28 13:58:30', site: 'B廠', category: 'HVAC', section: 'MECH', tagName: 'HVAC-CH-B02-TEMP', message: 'High Condenser Temp', description: 'Condenser water temperature exceeded 35°C', priority: 'P2', count: 2 },
  { key: '4', time: '2026-03-28 13:45:11', site: 'A廠', category: 'GC', section: 'PIPE', tagName: 'GC-CDA-COMP-01-VIB', message: 'High Vibration', description: 'Compressor vibration exceeded 7mm/s', priority: 'P2', count: 5 },
  { key: '5', time: '2026-03-28 12:30:05', site: 'B廠', category: 'WTS', section: 'I&C', tagName: 'WTS-RO-B01-PRES', message: 'Low Feed Pressure', description: 'RO feed pressure dropped below 10 bar', priority: 'P2', count: 1 },
  { key: '6', time: '2026-03-28 11:22:18', site: 'A廠', category: 'HVAC', section: 'MECH', tagName: 'HVAC-MAU-A01-FILT', message: 'Filter DP High', description: 'MAU pre-filter differential pressure high', priority: 'P3', count: 1 },
  { key: '7', time: '2026-03-28 10:15:33', site: 'A廠', category: 'EI', section: 'ELEC', tagName: 'EI-TR-A01-TEMP', message: 'Transformer Temp Warning', description: 'Oil temperature approaching limit 85°C', priority: 'P3', count: 2 },
  { key: '8', time: '2026-03-28 09:48:22', site: 'B廠', category: 'GC', section: 'PIPE', tagName: 'GC-N2-GEN-01-PUR', message: 'N2 Purity Low', description: 'N2 purity dropped below 99.999%', priority: 'P1', count: 1 },
  { key: '9', time: '2026-03-28 08:30:15', site: 'A廠', category: 'WTS', section: 'MECH', tagName: 'WTS-PCW-P01-FLOW', message: 'Low Flow Rate', description: 'PCW pump flow rate below setpoint', priority: 'P3', count: 3 },
  { key: '10', time: '2026-03-28 07:55:40', site: 'B廠', category: 'HVAC', section: 'I&C', tagName: 'HVAC-RCU-B01-HUM', message: 'High Humidity', description: 'Cleanroom humidity exceeded 50% RH', priority: 'P2', count: 4 },
  { key: '11', time: '2026-03-27 22:15:30', site: 'A廠', category: 'EI', section: 'ELEC', tagName: 'EI-PDU-A03-LOAD', message: 'High Load Warning', description: 'PDU load reached 85% capacity', priority: 'P3', count: 1 },
  { key: '12', time: '2026-03-27 20:42:18', site: 'B廠', category: 'WTS', section: 'PIPE', tagName: 'WTS-WWT-B01-PH', message: 'pH Out of Range', description: 'Wastewater pH exceeded discharge limit', priority: 'P1', count: 2 },
  { key: '13', time: '2026-03-27 18:30:55', site: 'A廠', category: 'GC', section: 'I&C', tagName: 'GC-CDA-DRY-02-DEW', message: 'High Dewpoint', description: 'CDA dryer outlet dewpoint above -40°C', priority: 'P2', count: 1 },
  { key: '14', time: '2026-03-27 16:20:10', site: 'A廠', category: 'HVAC', section: 'MECH', tagName: 'HVAC-CH-A01-AMP', message: 'High Motor Current', description: 'Chiller compressor motor current high', priority: 'P3', count: 2 },
  { key: '15', time: '2026-03-27 14:10:25', site: 'B廠', category: 'EI', section: 'ELEC', tagName: 'EI-GEN-B01-FUEL', message: 'Low Fuel Level', description: 'Emergency generator fuel tank below 30%', priority: 'P4', count: 1 },
  { key: '16', time: '2026-03-27 11:55:48', site: 'A廠', category: 'WTS', section: 'I&C', tagName: 'WTS-EDI-A01-RES', message: 'Low Resistivity', description: 'EDI outlet resistivity below 16 MΩ', priority: 'P2', count: 3 },
  { key: '17', time: '2026-03-27 09:30:12', site: 'B廠', category: 'HVAC', section: 'MECH', tagName: 'HVAC-MAU-B01-TEMP', message: 'Supply Air Temp High', description: 'MAU supply air temperature exceeded 24°C', priority: 'P3', count: 1 },
  { key: '18', time: '2026-03-27 07:22:35', site: 'A廠', category: 'GC', section: 'PIPE', tagName: 'GC-VMB-A01-LEAK', message: 'Gas Leak Detected', description: 'VMB area gas leak sensor triggered', priority: 'P1', count: 1 },
  { key: '19', time: '2026-03-26 23:45:20', site: 'B廠', category: 'EI', section: 'ELEC', tagName: 'EI-UPS-B01-BYPASS', message: 'UPS on Bypass', description: 'UPS switched to bypass mode automatically', priority: 'P1', count: 1 },
  { key: '20', time: '2026-03-26 21:18:44', site: 'A廠', category: 'WTS', section: 'MECH', tagName: 'WTS-CT-A01-TEMP', message: 'High Basin Temp', description: 'Cooling tower basin temperature high', priority: 'P4', count: 2 },
  { key: '21', time: '2026-03-26 19:05:30', site: 'B廠', category: 'HVAC', section: 'MECH', tagName: 'HVAC-CHP-B01-PRES', message: 'Low Refrigerant', description: 'Chiller refrigerant pressure low', priority: 'P2', count: 1 },
  { key: '22', time: '2026-03-26 16:40:15', site: 'A廠', category: 'EI', section: 'ELEC', tagName: 'EI-ACB-A02-TRIP', message: 'Breaker Trip', description: 'Air circuit breaker unexpected trip', priority: 'P1', count: 1 },
  { key: '23', time: '2026-03-26 14:28:50', site: 'B廠', category: 'GC', section: 'PIPE', tagName: 'GC-SCR-B01-FLOW', message: 'Low Scrubber Flow', description: 'Exhaust scrubber water flow rate low', priority: 'P3', count: 2 },
  { key: '24', time: '2026-03-26 12:15:33', site: 'A廠', category: 'WTS', section: 'I&C', tagName: 'WTS-RO-A01-COND', message: 'High Conductivity', description: 'RO permeate conductivity above limit', priority: 'P2', count: 1 },
  { key: '25', time: '2026-03-26 10:02:18', site: 'B廠', category: 'HVAC', section: 'I&C', tagName: 'HVAC-FFU-B-SEC3', message: 'FFU Fault', description: 'Fan filter unit in Section 3 stopped', priority: 'P2', count: 1 },
  { key: '26', time: '2026-03-26 08:48:42', site: 'A廠', category: 'EI', section: 'ELEC', tagName: 'EI-ATS-A01-FAIL', message: 'ATS Transfer Fail', description: 'Automatic transfer switch failed to operate', priority: 'P1', count: 1 },
  { key: '27', time: '2026-03-25 22:30:15', site: 'B廠', category: 'WTS', section: 'I&C', tagName: 'WTS-UV-B01-INT', message: 'UV Intensity Low', description: 'UV lamp intensity below sterilization threshold', priority: 'P3', count: 1 },
  { key: '28', time: '2026-03-25 18:15:28', site: 'A廠', category: 'GC', section: 'PIPE', tagName: 'GC-CDA-TK-01-PRES', message: 'Tank Pressure Low', description: 'CDA storage tank pressure below 7 bar', priority: 'P4', count: 3 },
  { key: '29', time: '2026-03-25 14:50:40', site: 'B廠', category: 'HVAC', section: 'MECH', tagName: 'HVAC-CT-B01-VIB', message: 'Fan Vibration High', description: 'Cooling tower fan vibration alarm', priority: 'P3', count: 2 },
  { key: '30', time: '2026-03-25 10:25:55', site: 'A廠', category: 'EI', section: 'I&C', tagName: 'EI-BAT-A01-TEMP', message: 'Battery Room Temp', description: 'Battery room ambient temperature exceeded 30°C', priority: 'P4', count: 1 },
];
