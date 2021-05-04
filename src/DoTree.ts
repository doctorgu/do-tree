export enum TreeFilterOptions {
  returnFlat,
  returnTree,
  returnTreeRespectChildren,
}

export enum TreeMapOptions {
  returnFlat,
  returnTree,
}

class DoTree {
  private static addFlatByFilter(
    list: any[],
    callback: (item: any) => boolean,
    listNew: any[]
  ) {
    list.forEach((item: any) => {
      const found = callback(item);
      if (found) {
        const itemNew = { ...item, children: undefined };
        listNew.push(itemNew);
      }

      if (item.children && item.children.length) {
        DoTree.addFlatByFilter(item.children, callback, listNew);
      }
    });
  }

  private static addTreeByFilter(
    list: any[],
    callback: (item: any) => boolean,
    listNew: any[]
  ) {
    list.forEach((item: any) => {
      const found = callback(item);
      if (found) {
        const itemNew = { ...item, children: [] };
        listNew.push(itemNew);

        if (item.children && item.children.length) {
          DoTree.addTreeByFilter(item.children, callback, itemNew.children);
        }
      }
    });
  }

  private static addFlatWithParent(
    list: any[],
    parentKey: string,
    callback: (item: any) => boolean,
    listNew: any[]
  ) {
    list.forEach((item: any, index: number) => {
      const found = callback(item);
      const itemNew = {
        ...item,
        __found: found,
        __key: `${parentKey}.${index}`,
        __parentKey: parentKey,
        children: undefined,
      };
      listNew.push(itemNew);

      if (item.children && item.children.length) {
        DoTree.addFlatWithParent(
          item.children,
          itemNew.__key,
          callback,
          listNew
        );
      }
    });
  }

  private static setFound(list: any[]) {
    const listLeaf = list.filter(
      (item: any) =>
        !list.some((item2: any) => item2.__parentKey === item.__key)
    );

    listLeaf.forEach((item) => {
      let itemCur = { ...item };

      while (itemCur) {
        itemCur = list.find(
          (item2: any) => item2.__key === itemCur.__parentKey
        );
        if (itemCur && !itemCur.__found) {
          itemCur.__found =
            list.filter(
              (item2: any) =>
                item2.__found && item2.__parentKey === itemCur.__key
            ).length > 0;
        }
      }
    });
  }

  private static flatToTree(listFlat: any[], listTree: any[]) {
    listTree.forEach((itemTree: any) => {
      const children = listFlat.filter(
        (itemFlat: any) => itemFlat.__parentKey === itemTree.__key
      );
      itemTree.children = children;

      DoTree.flatToTree(listFlat, itemTree.children);
    });
  }

  private static deleteTwoUnderbar(list: any[]): any[] {
    return DoTree.map(list, TreeMapOptions.returnTree, (item: any) => {
      const itemNew = { ...item };
      delete itemNew.__found;
      delete itemNew.__key;
      delete itemNew.__parentKey;
      return itemNew;
    });
  }

  private static addTreeByFilterRespectChildren(
    list: any[],
    callback: (item: any) => boolean
  ): any[] {
    const listFlat: any[] = [];
    DoTree.addFlatWithParent(list, "0", callback, listFlat);
    DoTree.setFound(listFlat);

    const listFlat2 = listFlat.filter((item: any) => item.__found);

    const listRoot = listFlat2.filter(
      (item: any) =>
        !listFlat2.some((item2: any) => item2.__key === item.__parentKey)
    );
    DoTree.flatToTree(listFlat2, listRoot);

    const listNew = DoTree.deleteTwoUnderbar(listRoot);

    return listNew;
  }

  private static addFlatByMap(
    list: any[],
    callback: (item: any) => any,
    listNew: any[]
  ) {
    list.forEach((item: any) => {
      const itemNew = callback(item);
      listNew.push(itemNew);

      if (item.children && item.children.length) {
        DoTree.addFlatByMap(item.children, callback, listNew);
      }
    });
  }

  private static addTreeByMap(
    list: any[],
    callback: (item: any) => any,
    listNew: any[]
  ) {
    list.forEach((item: any) => {
      const itemNew = callback(item);
      listNew.push(itemNew);

      if (item.children && item.children.length) {
        itemNew.children = [];
        DoTree.addTreeByMap(item.children, callback, itemNew.children);
      }
    });
  }

  private static changeToChildrenProp2(
    list: any[],
    fromPropName: string,
    listNew: any[]
  ) {
    list.forEach((item: any) => {
      const itemNew = { ...item };
      listNew.push(itemNew);

      const fromProp = itemNew[fromPropName];
      if (fromProp) {
        delete itemNew[fromPropName];
        itemNew.children = [];

        DoTree.changeToChildrenProp2(
          item[fromPropName],
          fromPropName,
          itemNew.children
        );
      }
    });
  }

  static changeToChildrenProp(list: any[], fromPropName: string) {
    const listNew: any[] = [];
    DoTree.changeToChildrenProp2(list, fromPropName, listNew);
    return listNew;
  }

  static map(
    list: any[],
    options: TreeMapOptions,
    callback: (item: any) => any
  ): any[] {
    const listNew: any[] = [];

    if (options === TreeMapOptions.returnFlat) {
      DoTree.addFlatByMap(list, callback, listNew);
    } else if (options === TreeMapOptions.returnTree) {
      DoTree.addTreeByMap(list, callback, listNew);
    }

    return listNew;
  }

  static find(list: any[], callback: (item: any) => boolean): any {
    for (const item of list) {
      const found = callback(item);
      if (found) {
        return item;
      }
      if (item.children) {
        const foundChild = DoTree.find(item.children, callback);
        if (foundChild) {
          return foundChild;
        }
      }
    }

    return undefined;
  }

  static findIndex(list: any[], callback: (item: any) => boolean): number[] {
    let index = -1;

    for (const item of list) {
      index += 1;

      const found = callback(item);
      if (found) {
        return [index];
      }

      if (item.children) {
        const indiceChild = DoTree.findIndex(item.children, callback);
        if (indiceChild.length) {
          return [index, ...indiceChild];
        }
      }
    }

    return [];
  }

  static some(list: any[], callback: (item: any) => boolean): boolean {
    for (const item of list) {
      const found = callback(item);
      if (found) {
        return true;
      }

      if (item.children) {
        const foundChild = DoTree.find(item.children, callback);
        if (foundChild) {
          return true;
        }
      }
    }

    return false;
  }

  static filter(
    list: any[],
    options: TreeFilterOptions,
    callback: (item: any) => boolean
  ): any[] {
    let listNew: any[] = [];

    if (options === TreeFilterOptions.returnFlat) {
      DoTree.addFlatByFilter(list, callback, listNew);
    } else if (options === TreeFilterOptions.returnTree) {
      DoTree.addTreeByFilter(list, callback, listNew);
    } else if (options === TreeFilterOptions.returnTreeRespectChildren) {
      listNew = DoTree.addTreeByFilterRespectChildren(list, callback);
    }

    return listNew;
  }

  static count(list: any[]): number {
    let cnt = 0;

    for (const item of list) {
      cnt += 1;

      const cntChild = item.children ? DoTree.count(item.children) : 0;

      cnt += cntChild;
    }

    return cnt;
  }
}

export default DoTree;
