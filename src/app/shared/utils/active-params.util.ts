import { Params } from '@angular/router';
import { ActiveParamsType } from '../../../types/active-params.type';

export class ActiveParamsUtil {
  static processParams(params: Params): ActiveParamsType {
    const activeParams: ActiveParamsType = { types: [] };
    if (params.hasOwnProperty('types')) {
      activeParams.types = Array.isArray(params['types']) ? params['types'] : [];
    }
    if (params.hasOwnProperty('heightTo')) {
      activeParams.heightTo = params['heightTo'];
    }
    if (params.hasOwnProperty('heightFrom')) {
      activeParams.heightFrom = params['heightFrom'];
    }
    if (params.hasOwnProperty('diameterTo')) {
      activeParams.diameterTo = params['diameterTo'];
    }
    if (params.hasOwnProperty('diameterFrom')) {
      activeParams.diameterFrom = params['diameterFrom'];
    }
    if (params.hasOwnProperty('sort')) {
      activeParams.sort = params['sort'];
    }
    if (params.hasOwnProperty('page')) {
      // из URL параметр приходит строкой — приводим к числу,
      // иначе сравнения и инкремент страницы работают некорректно
      const page = Number(params['page']);
      activeParams.page = !page || page < 1 ? 1 : page;
    }
    return activeParams;
  }
}
