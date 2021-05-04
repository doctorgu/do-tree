// import DoTree, { TreeFilterOptions, TreeMapOptions } from "./DoTree";
const {
  default: DoTree,
  TreeFilterOptions,
  TreeMapOptions,
} = require("./DoTree");

describe("DoTree tests", () => {
  it("should not throw error", () => {
    function changeToChildrenProp() {
      const list = [
        {
          path: "/test",
          routes: [{ path: "/test2", routes: [{ path: "/test3" }] }],
        },
      ];
      const listNew = DoTree.changeToChildrenProp(list, "routes");
      const json = JSON.stringify(listNew);
      if (json.indexOf("routes") !== -1)
        throw new Error(`routes still exists. json: ${json}`);
    }

    function map() {
      const list = [{ val: 1 }, { val: 2, children: [{ val: 3 }] }];
      const callback = (item: any) => ({ ...item, double: item.val * 2 });

      const listFlatMapped = DoTree.map(
        list,
        TreeMapOptions.returnFlat,
        callback
      );
      const listTreeMapped = DoTree.map(
        list,
        TreeMapOptions.returnTree,
        callback
      );

      const jsonFlatMapped = JSON.stringify(listFlatMapped);
      const jsonTreeMapped = JSON.stringify(listTreeMapped);

      if (Array.from(jsonFlatMapped.matchAll(/"double":/g)).length !== 3)
        throw new Error(
          `count of double is not 3. jsonFlatMapped: ${jsonFlatMapped}`
        );

      if (Array.from(jsonTreeMapped.matchAll(/"double":/g)).length !== 3)
        throw new Error(
          `count of double is not 3. jsonTreeMapped: ${jsonTreeMapped}`
        );
    }

    function find() {
      const list = [{ a: 1 }, { a: 2, children: [{ a: 3 }] }];
      const callback = (item: any) => item.a === 3;

      const listTreeFound = DoTree.find(list, callback);

      if (!listTreeFound) {
        throw new Error(`Not found`);
      }
    }

    function findIndex() {
      const list = [{ a: 1 }, { a: 2, children: [{ a: 3 }] }];
      const callback = (item: any) => item.a === 3;

      const indiceFound = DoTree.findIndex(list, callback);

      if (indiceFound.length !== 2) {
        throw new Error(`Not found`);
      }
    }

    function some() {
      const list = [{ a: 1 }, { a: 2, children: [{ a: 3 }] }];
      const callback = (item: any) => item.a === 3;

      const listTreeFound = DoTree.some(list, callback);

      if (!listTreeFound) {
        throw new Error(`Not found`);
      }
    }

    function filter() {
      const list = [
        { a: 1 },
        { a: 2, children: [{ a: 3, children: [{ a: 4 }] }] },
      ];

      const callback1 = (item: any) => item.a <= 2;

      const found1 = DoTree.filter(
        list,
        TreeFilterOptions.returnFlat,
        callback1
      );
      if (found1.length !== 2) {
        throw new Error(`length is not 2. found1: ${found1}`);
      }

      const found2 = DoTree.filter(
        list,
        TreeFilterOptions.returnTree,
        callback1
      );
      const json2 = JSON.stringify(found2);
      if (Array.from(json2.matchAll(/"a":/g)).length !== 2) {
        throw new Error(`length is not 2. json2: ${json2}`);
      }

      const found3 = DoTree.filter(
        list,
        TreeFilterOptions.returnTreeRespectChildren,
        callback1
      );
      const json3 = JSON.stringify(found3);
      if (Array.from(json3.matchAll(/"a":/g)).length !== 2) {
        throw new Error(`length is not 2. json3: ${json3}`);
      }

      const callback2 = (item: any) => item.a >= 3;

      const found4 = DoTree.filter(
        list,
        TreeFilterOptions.returnFlat,
        callback2
      );
      if (found4.length !== 2) {
        throw new Error(`length is not 2. found4: ${found4}`);
      }

      const found5 = DoTree.filter(
        list,
        TreeFilterOptions.returnTree,
        callback2
      );
      if (found5.length !== 0) {
        throw new Error(`length is not 0. found5: ${found5}`);
      }

      const found6 = DoTree.filter(
        list,
        TreeFilterOptions.returnTreeRespectChildren,
        callback2
      );
      const json6 = JSON.stringify(found6);
      if (Array.from(json6.matchAll(/"a":/g)).length !== 3) {
        throw new Error(`length is not 3. json6: ${json6}`);
      }
    }

    expect(changeToChildrenProp).not.toThrowError();
    expect(map).not.toThrowError();
    expect(find).not.toThrowError();
    expect(findIndex).not.toThrowError();
    expect(some).not.toThrowError();
    expect(filter).not.toThrowError();
  });
});
