export interface ProvinceData {
  province: string;
  districts: {
    name: string;
    chiefdoms?: string[];
  }[];
}

export const SIERRA_LEONE_REGIONS: ProvinceData[] = [
  {
    province: 'Eastern Province',
    districts: [
      {
        name: 'Kenema',
        chiefdoms: ['Nongowa', 'Dama', 'Gaura', 'Kandu Leppiama', 'Koya', 'Langurama', 'Lower Bambara', 'Malegohun', 'Niawa', 'Nomo', 'Small Bo', 'Tunkia', 'Wandor'],
      },
      {
        name: 'Kailahun',
        chiefdoms: ['Luawa', 'Dea', 'Jaluahun', 'Jawei', 'Kissi Kama', 'Kissi Teng', 'Kissi Tongi', 'Kpeje Bongre', 'Kpeje West', 'Malema', 'Mandu', 'Peje West', 'Penguia', 'Upper Bambara', 'Yawei'],
      },
      {
        name: 'Kono',
        chiefdoms: ['Gbense', 'Tankoro', 'Fiama', 'Gbane', 'Gbane Kandor', 'Gorama Kono', 'Kamara', 'Mafindor', 'Nimikoro', 'Nimiyama', 'Sandor', 'Soa', 'Lei', 'Toli'],
      },
    ],
  },
  {
    province: 'Southern Province',
    districts: [
      { name: 'Bo', chiefdoms: ['Kakua', 'Badjia', 'Bagbo', 'Bagbwe', 'Baoma', 'Bumpeh Ngao', 'Gbo', 'Jaiama Bongor', 'Komboya', 'Lugbu', 'Niawa Lenga', 'Selenga', 'Tikonko', 'Valunia', 'Wonde'] },
      { name: 'Bonthe', chiefdoms: ['Bonthe Urban', 'Banta', 'Bum', 'Dema', 'Jong', 'Kpanda Kemo', 'Kwamebai Krim', 'Sogbini', 'Sittia', 'Yawbeko'] },
      { name: 'Moyamba', chiefdoms: ['Kaiyamba', 'Bagruwa', 'Banta', 'Banta Mokele', 'Bumpeh', 'Dasse', 'Fakunya', 'Kagboro', 'Kamajei', 'Kongbora', 'Kori', 'Kowa', 'Ribbi', 'Timdale'] },
      { name: 'Pujehun', chiefdoms: ['Panga Kabonde', 'Barri', 'Gallinas Perri', 'Kpaka', 'Makpele', 'Malen', 'Mano Sakrim', 'Peje', 'Soro Gbema', 'Sowa', 'Yakemu Kpukumu'] },
    ],
  },
  {
    province: 'Northern Province',
    districts: [
      { name: 'Bombali', chiefdoms: ['Makeni City', 'Biriwa', 'Bombali Sebora', 'Bombali Shebora', 'Gbanti', 'Kamaranka', 'Magbaimba Ndorwahun', 'Mara', 'Paki Masabong', 'Safroko Limba'] },
      { name: 'Tonkolili', chiefdoms: ['Gbonkolenken', 'Kafe Simiria', 'Kalansogoia', 'Kholifa Mabang', 'Kholifa Rowalla', 'Kunike', 'Kunike Barina', 'Malal Mara', 'Poli', 'Sambaya', 'Tane', 'Yoni'] },
      { name: 'Koinadugu', chiefdoms: ['Fasogo', 'Diang', 'Kasunko', 'Mongo', 'Neya', 'Nieni', 'Sengbe', 'Wara Wara Bafodia', 'Wara Wara Yagala'] },
      { name: 'Falaba', chiefdoms: ['Dembelia Sinkunia', 'Folosaba Dembelia', 'Kamadugu', 'Kebelia', 'Kulor Saradu', 'Mongo', 'Morifindugu', 'Neya', 'Nyedu', 'Panga', 'Sulima'] },
    ],
  },
  {
    province: 'North West Province',
    districts: [
      { name: 'Port Loko', chiefdoms: ['Port Loko City', 'Bake Loko', 'Bureh Kasseh Maconteh', 'Dibia', 'Kaffu Bullom', 'Koya', 'Lokomasama', 'Maforki', 'Marampa', 'Masimera', 'Sanda Magbolontor', 'TMS'] },
      { name: 'Kambia', chiefdoms: ['Bramaia', 'Gbinle Dixing', 'Magbema', 'Mambolo', 'Masungbala', 'Samu', 'Tonko Limba'] },
      { name: 'Karene', chiefdoms: ['Buya Romende', 'Debia', 'Gbonko Maria', 'Libiesaygahun', 'Mafonda', 'Sanda Tendaren', 'Sanda Loko', 'Sella Limba', 'Tambakha'] },
    ],
  },
  {
    province: 'Western Area',
    districts: [
      { name: 'Western Area Urban', chiefdoms: ['Central Freetown', 'East Freetown', 'West Freetown'] },
      { name: 'Western Area Rural', chiefdoms: ['Waterloo', 'Koya Rural', 'Mountain Rural', 'York'] },
    ],
  },
];
