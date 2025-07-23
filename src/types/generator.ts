export type SpaceType = "bedroom" | "living_room" | "kitchen";
export type SpaceStyle = "modern" | "minimalist" | "industrial_loft";

export type SpaceGeneratorResponse = {
  data: string;
};

export type SpaceGeneratorRequest = {
  model: string;
  imageUrl: string;
  spaceType: string;
  spaceStyle: string;
  renovateType: string;
};

export type PoolResult = {
  status: string;
  result: string[];
  webhook: string;
};

export type PoolResultResponse = {
  data: PoolResult;
};
