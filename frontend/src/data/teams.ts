export interface Team {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

export const teams: Team[] = [
  { id: 'ALA', name: 'Alabama', primaryColor: '#9E1B32', secondaryColor: '#FFFFFF' },
  { id: 'ARK', name: 'Arkansas', primaryColor: '#9D2235', secondaryColor: '#FFFFFF' },
  { id: 'AUB', name: 'Auburn', primaryColor: '#0C2340', secondaryColor: '#E87722' },
  { id: 'FLA', name: 'Florida', primaryColor: '#0021A5', secondaryColor: '#FA4616' },
  { id: 'UGA', name: 'Georgia', primaryColor: '#BA0C2F', secondaryColor: '#000000' },
  { id: 'UK', name: 'Kentucky', primaryColor: '#0033A0', secondaryColor: '#FFFFFF' },
  { id: 'LSU', name: 'LSU', primaryColor: '#461D7C', secondaryColor: '#FDD023' },
  { id: 'MISS', name: 'Ole Miss', primaryColor: '#CE1126', secondaryColor: '#14213D' },
  { id: 'MSST', name: 'Mississippi State', primaryColor: '#660000', secondaryColor: '#FFFFFF' },
  { id: 'MIZZ', name: 'Missouri', primaryColor: '#F1B82D', secondaryColor: '#000000' },
  { id: 'SCAR', name: 'South Carolina', primaryColor: '#73000A', secondaryColor: '#000000' },
  { id: 'TENN', name: 'Tennessee', primaryColor: '#FF8200', secondaryColor: '#FFFFFF' },
  { id: 'TXAM', name: 'Texas A&M', primaryColor: '#500000', secondaryColor: '#FFFFFF' },
  { id: 'VAN', name: 'Vanderbilt', primaryColor: '#000000', secondaryColor: '#866D4B' },
  { id: 'ILL', name: 'Illinois', primaryColor: '#E84A27', secondaryColor: '#13294B' },
  { id: 'IND', name: 'Indiana', primaryColor: '#990000', secondaryColor: '#FFFFFF' },
  { id: 'IOWA', name: 'Iowa', primaryColor: '#000000', secondaryColor: '#FFD700' },
  { id: 'MD', name: 'Maryland', primaryColor: '#E03A3E', secondaryColor: '#FFD520' },
  { id: 'MICH', name: 'Michigan', primaryColor: '#00274C', secondaryColor: '#FFCB05' },
  { id: 'MSU', name: 'Michigan State', primaryColor: '#18453B', secondaryColor: '#FFFFFF' },
  { id: 'MINN', name: 'Minnesota', primaryColor: '#7A0019', secondaryColor: '#FFCC33' },
  { id: 'NEB', name: 'Nebraska', primaryColor: '#E41C38', secondaryColor: '#FFFFFF' },
  { id: 'NW', name: 'Northwestern', primaryColor: '#4E2A84', secondaryColor: '#FFFFFF' },
  { id: 'OSU', name: 'Ohio State', primaryColor: '#BB0000', secondaryColor: '#666666' },
  { id: 'PSU', name: 'Penn State', primaryColor: '#041E42', secondaryColor: '#FFFFFF' },
  { id: 'PUR', name: 'Purdue', primaryColor: '#CEB888', secondaryColor: '#000000' },
  { id: 'RUTG', name: 'Rutgers', primaryColor: '#CC0033', secondaryColor: '#5F6A72' },
  { id: 'WIS', name: 'Wisconsin', primaryColor: '#C5050C', secondaryColor: '#FFFFFF' },
  { id: 'BAY', name: 'Baylor', primaryColor: '#003015', secondaryColor: '#FFB81C' },
  { id: 'ISU', name: 'Iowa State', primaryColor: '#C8102E', secondaryColor: '#F1BE48' },
  { id: 'KU', name: 'Kansas', primaryColor: '#0051BA', secondaryColor: '#E8000D' },
  { id: 'KSU', name: 'Kansas State', primaryColor: '#512888', secondaryColor: '#FFFFFF' },
  { id: 'OKLA', name: 'Oklahoma', primaryColor: '#841617', secondaryColor: '#FDF9D8' },
  { id: 'OKST', name: 'Oklahoma State', primaryColor: '#FF7300', secondaryColor: '#000000' },
  { id: 'TCU', name: 'TCU', primaryColor: '#4D1979', secondaryColor: '#A3A9AC' },
  { id: 'TEX', name: 'Texas', primaryColor: '#BF5700', secondaryColor: '#FFFFFF' },
  { id: 'TTU', name: 'Texas Tech', primaryColor: '#CC0000', secondaryColor: '#000000' },
  { id: 'WVU', name: 'West Virginia', primaryColor: '#002855', secondaryColor: '#EAAA00' },
  { id: 'ARIZ', name: 'Arizona', primaryColor: '#CC0033', secondaryColor: '#003366' },
  { id: 'ASU', name: 'Arizona State', primaryColor: '#8C1D40', secondaryColor: '#FFC627' },
  { id: 'CAL', name: 'California', primaryColor: '#003262', secondaryColor: '#FDB515' },
  { id: 'COLO', name: 'Colorado', primaryColor: '#CFB87C', secondaryColor: '#000000' },
  { id: 'ORE', name: 'Oregon', primaryColor: '#154733', secondaryColor: '#FEE123' },
  { id: 'ORST', name: 'Oregon State', primaryColor: '#DC4405', secondaryColor: '#000000' },
  { id: 'STAN', name: 'Stanford', primaryColor: '#8C1515', secondaryColor: '#FFFFFF' },
  { id: 'UCLA', name: 'UCLA', primaryColor: '#2D68C4', secondaryColor: '#F2A900' },
  { id: 'USC', name: 'USC', primaryColor: '#990000', secondaryColor: '#FFC72C' },
  { id: 'UTAH', name: 'Utah', primaryColor: '#CC0000', secondaryColor: '#FFFFFF' },
  { id: 'WASH', name: 'Washington', primaryColor: '#4B2E83', secondaryColor: '#B7A57A' },
  { id: 'WSU', name: 'Washington State', primaryColor: '#981E32', secondaryColor: '#5E6A71' },
  { id: 'BC', name: 'Boston College', primaryColor: '#98002E', secondaryColor: '#BC9B6A' },
  { id: 'CLEM', name: 'Clemson', primaryColor: '#F66733', secondaryColor: '#522D80' },
  { id: 'DUKE', name: 'Duke', primaryColor: '#003087', secondaryColor: '#FFFFFF' },
  { id: 'FSU', name: 'Florida State', primaryColor: '#782F40', secondaryColor: '#CEB888' },
  { id: 'GT', name: 'Georgia Tech', primaryColor: '#B3A369', secondaryColor: '#003057' },
  { id: 'LOU', name: 'Louisville', primaryColor: '#AD0000', secondaryColor: '#000000' },
  { id: 'MIA', name: 'Miami', primaryColor: '#F47321', secondaryColor: '#005030' },
  { id: 'UNC', name: 'North Carolina', primaryColor: '#7BAFD4', secondaryColor: '#FFFFFF' },
  { id: 'NCST', name: 'NC State', primaryColor: '#CC0000', secondaryColor: '#000000' },
  { id: 'PITT', name: 'Pittsburgh', primaryColor: '#003594', secondaryColor: '#FFB81C' },
  { id: 'SYR', name: 'Syracuse', primaryColor: '#F76900', secondaryColor: '#000000' },
  { id: 'UVA', name: 'Virginia', primaryColor: '#232D4B', secondaryColor: '#F84C1E' },
  { id: 'VT', name: 'Virginia Tech', primaryColor: '#630031', secondaryColor: '#CF4420' },
  { id: 'WAKE', name: 'Wake Forest', primaryColor: '#9E7E38', secondaryColor: '#000000' },
  { id: 'JMU', name: 'James Madison', primaryColor: '#450084', secondaryColor: '#CBB677' },
  // Group of 5 Conferences
  // American Athletic Conference
  { id: 'CIN', name: 'Cincinnati', primaryColor: '#E00122', secondaryColor: '#000000' },
  { id: 'ECU', name: 'East Carolina', primaryColor: '#592A8A', secondaryColor: '#FDC82F' },
  { id: 'HOU', name: 'Houston', primaryColor: '#C8102E', secondaryColor: '#B2B4B2' },
  { id: 'MEM', name: 'Memphis', primaryColor: '#003087', secondaryColor: '#898D8D' },
  { id: 'NAVY', name: 'Navy', primaryColor: '#00205B', secondaryColor: '#C5B783' },
  { id: 'SMU', name: 'SMU', primaryColor: '#0033A0', secondaryColor: '#C8102E' },
  { id: 'TEM', name: 'Temple', primaryColor: '#9D2235', secondaryColor: '#FFFFFF' },
  { id: 'TULN', name: 'Tulane', primaryColor: '#006747', secondaryColor: '#418FDE' },
  { id: 'TLSA', name: 'Tulsa', primaryColor: '#002D72', secondaryColor: '#C8102E' },
  { id: 'UCF', name: 'UCF', primaryColor: '#FFC904', secondaryColor: '#000000' },
  { id: 'USF', name: 'South Florida', primaryColor: '#006747', secondaryColor: '#CFC493' },
  // Mountain West Conference
  { id: 'AFA', name: 'Air Force', primaryColor: '#003087', secondaryColor: '#8A8D8F' },
  { id: 'BSU', name: 'Boise State', primaryColor: '#0033A0', secondaryColor: '#D64309' },
  { id: 'CSU', name: 'Colorado State', primaryColor: '#1E4D2B', secondaryColor: '#C8C372' },
  { id: 'FSW', name: 'Fresno State', primaryColor: '#DB0032', secondaryColor: '#002E6D' },
  { id: 'HAW', name: 'Hawaii', primaryColor: '#024731', secondaryColor: '#FFFFFF' },
  { id: 'NEV', name: 'Nevada', primaryColor: '#003366', secondaryColor: '#807F84' },
  { id: 'UNM', name: 'New Mexico', primaryColor: '#BA0C2F', secondaryColor: '#63666A' },
  { id: 'SDSU', name: 'San Diego State', primaryColor: '#A6192E', secondaryColor: '#000000' },
  { id: 'SJSU', name: 'San Jose State', primaryColor: '#0055A2', secondaryColor: '#E5A823' },
  { id: 'UNLV', name: 'UNLV', primaryColor: '#CF0A2C', secondaryColor: '#000000' },
  { id: 'USU', name: 'Utah State', primaryColor: '#00263A', secondaryColor: '#8A8D8F' },
  { id: 'WYO', name: 'Wyoming', primaryColor: '#492F24', secondaryColor: '#FFC425' },
  // Conference USA
  { id: 'CHAR', name: 'Charlotte', primaryColor: '#046A38', secondaryColor: '#B9975B' },
  { id: 'FAU', name: 'Florida Atlantic', primaryColor: '#003366', secondaryColor: '#CC0000' },
  { id: 'FIU', name: 'FIU', primaryColor: '#081E3F', secondaryColor: '#B6862C' },
  { id: 'LT', name: 'Louisiana Tech', primaryColor: '#002F8B', secondaryColor: '#E31B23' },
  { id: 'MRSH', name: 'Marshall', primaryColor: '#00B140', secondaryColor: '#000000' },
  { id: 'MTSU', name: 'Middle Tennessee', primaryColor: '#0066CC', secondaryColor: '#000000' },
  { id: 'UNT', name: 'North Texas', primaryColor: '#00853E', secondaryColor: '#000000' },
  { id: 'ODU', name: 'Old Dominion', primaryColor: '#003057', secondaryColor: '#7C878E' },
  { id: 'RICE', name: 'Rice', primaryColor: '#00205B', secondaryColor: '#C1C6C8' },
  { id: 'UAB', name: 'UAB', primaryColor: '#1E6B52', secondaryColor: '#F4C300' },
  { id: 'USM', name: 'Southern Miss', primaryColor: '#FFAB00', secondaryColor: '#000000' },
  { id: 'UTEP', name: 'UTEP', primaryColor: '#FF8200', secondaryColor: '#041E42' },
  { id: 'UTSA', name: 'UTSA', primaryColor: '#F15A22', secondaryColor: '#002A5C' },
  { id: 'WKU', name: 'Western Kentucky', primaryColor: '#C60C30', secondaryColor: '#000000' },
  // MAC
  { id: 'AKR', name: 'Akron', primaryColor: '#041E42', secondaryColor: '#A89968' },
  { id: 'BALL', name: 'Ball State', primaryColor: '#BA0C2F', secondaryColor: '#000000' },
  { id: 'BGSU', name: 'Bowling Green', primaryColor: '#FE5000', secondaryColor: '#4F2C1D' },
  { id: 'BUFF', name: 'Buffalo', primaryColor: '#005BBB', secondaryColor: '#000000' },
  { id: 'CMU', name: 'Central Michigan', primaryColor: '#6A0032', secondaryColor: '#FFC82E' },
  { id: 'EMU', name: 'Eastern Michigan', primaryColor: '#006633', secondaryColor: '#000000' },
  { id: 'KENT', name: 'Kent State', primaryColor: '#002664', secondaryColor: '#EEB211' },
  { id: 'MIA-OH', name: 'Miami (OH)', primaryColor: '#B61E2E', secondaryColor: '#000000' },
  { id: 'NIU', name: 'Northern Illinois', primaryColor: '#CC0000', secondaryColor: '#000000' },
  { id: 'OHIO', name: 'Ohio', primaryColor: '#00694E', secondaryColor: '#CDA077' },
  { id: 'TOL', name: 'Toledo', primaryColor: '#003E7E', secondaryColor: '#FFB20F' },
  { id: 'WMU', name: 'Western Michigan', primaryColor: '#6C4023', secondaryColor: '#B5A167' },
  // Sun Belt
  { id: 'APP', name: 'Appalachian State', primaryColor: '#000000', secondaryColor: '#FFB700' },
  { id: 'ARST', name: 'Arkansas State', primaryColor: '#CC092F', secondaryColor: '#000000' },
  { id: 'CCU', name: 'Coastal Carolina', primaryColor: '#006F71', secondaryColor: '#A27752' },
  { id: 'GSU', name: 'Georgia Southern', primaryColor: '#041E42', secondaryColor: '#A28D5B' },
  { id: 'GAST', name: 'Georgia State', primaryColor: '#0039A6', secondaryColor: '#C60C30' },
  { id: 'ULL', name: 'Louisiana', primaryColor: '#CE181E', secondaryColor: '#000000' },
  { id: 'ULM', name: 'UL Monroe', primaryColor: '#800029', secondaryColor: '#FFB300' },
  { id: 'USA', name: 'South Alabama', primaryColor: '#00205B', secondaryColor: '#BF0D3E' },
  { id: 'TXST', name: 'Texas State', primaryColor: '#501214', secondaryColor: '#666666' },
  { id: 'TROY', name: 'Troy', primaryColor: '#8C2132', secondaryColor: '#C5C7C9' },
  // Independents
  { id: 'ARMY', name: 'Army', primaryColor: '#000000', secondaryColor: '#D4BF91' },
  { id: 'BYU', name: 'BYU', primaryColor: '#002E5D', secondaryColor: '#FFFFFF' },
  { id: 'LIB', name: 'Liberty', primaryColor: '#002D62', secondaryColor: '#C41230' },
  { id: 'NMSU', name: 'New Mexico State', primaryColor: '#861F41', secondaryColor: '#FFFFFF' },
  { id: 'ND', name: 'Notre Dame', primaryColor: '#0C2340', secondaryColor: '#C99700' },
  { id: 'UMASS', name: 'UMass', primaryColor: '#971B2F', secondaryColor: '#000000' },
  { id: 'CONN', name: 'UConn', primaryColor: '#000E2F', secondaryColor: '#FFFFFF' },
]; 