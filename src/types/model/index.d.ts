export * from './User';
export * from './Product';
export * from './Transaction';
export * from './Promotion';
export * from './Region';
export * from './About';
<<<<<<< HEAD
=======
export * from './Others';
>>>>>>> origin/Develop
// export * from './TypesShare';

export type Modelable<T> = {
  models?: T[];
  modelsLoaded?: boolean;
  model?: null | T;
  modelLoaded?: boolean;
};

export type ModelablePaginate<T> = {
  models?: T[];
  modelsLoaded?: boolean;
  page: number;
  perPage: number;
  isPageEnd?: boolean;
};
