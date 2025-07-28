export type SpaceType = "bedroom" | "living_room" | "dining_room";
export type SpaceStyle = "modern" | "minimalist" | "industrial_loft";

export type SpaceTypeItem = {
  key: SpaceType;
  name: string;
};

export type SpaceStyleItem = {
  key: SpaceStyle;
  name: string;
};

export type SpaceGeneratorResponse = {
  data: string;
};

export type SpaceGeneratorRequest = {
  model: string;
  imageUrl: string;
  spaceType: SpaceType;
  spaceStyle: SpaceStyle;
  renovateType: string;
};

type PollStatus = "processing" | "success" | "failed";
export type PoolResult = {
  status: PollStatus;
  result: string[];
  webhook: string;
  progress: number;
};

export type PoolResultResponse = {
  data: PoolResult;
};
