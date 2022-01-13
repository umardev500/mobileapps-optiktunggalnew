export type RegionModel = {
  id?: string;
  nama?: string;
}

export type ProvinceModel = RegionModel & {
  // 
};

export type CityModel = RegionModel & {
  // 
};

export type DistrictModel = RegionModel & {
  // 
};

export type VillageModel = RegionModel & {
  // 
};
