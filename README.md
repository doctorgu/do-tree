# DoTree

- [README Korean](README.ko.md)

Functions needed for parent-child type arrays(like Menu, Sub tables of table).

It assumes all child items belong to array typed `children` property of parent item.
If other property used then you can change to `children` using `changeToChildrenProp` function.

## Install

```bash
npm install do-tree
yarn add do-tree
```

## Problem

`map`, `find`, `filter`, `some` of Javascript functions on 1 depth array.
For example, following returns name is b out of name is a, b, cb.

```Javascript
const list = [
    { name: 'a' },
    { name: 'b' },
    { name: 'c' }
];
const filtered = list.filter(item => item.name !== 'b');
console.log(filtered); // [ { name: 'a' }, { name: 'c' } ]
```

But it is difficult to implement when you want to filter also sub items defined with `children` as following.

```Javascript
const list = [
    { name: 'a' },
    { name: 'b' },
    { name: 'c', children: [
                { name: 'a', children: [
                                { name: 'a' },
                                { name: 'b' }
                            ]
                },
                { name: 'b' }
            ]
    }
];
```

## Solution

Implement DoTree class as following.

```Javascript
const list = [
    { name: 'a' },
    { name: 'b' },
    { name: 'c', children: [
                { name: 'a', children: [
                                { name: 'a' },
                                { name: 'b' }
                            ]
                },
                { name: 'b' }
            ]
    }
];
const filtered = DoTree.filter(list, TreeFilterOptions.returnTree, (item => item.name !== 'b'));
console.log(filtered);
/*
[
    { name: 'a' },
    { name: 'c', children: [
                    { name: 'a', children: [
                                    { name: 'a' },
                                ]
                    },
                ]
    }
]
*/
```

## API

### changeToChildrenProp

Change property name which has sub items to `children` which is standard name.

- Example

```Javascript
const list = [ path: '/test', routes: [ path: '/test2' ] ];
const listNew = DoTree.changeToChildrenProp(list, 'routes');
console.log(listNew); // [ path: '/test', children: [ path: '/test2' ] ]
```

### map

Same with `map` of Javascript except

1. Search deeply with `children` property.

2. There's two options which affect to result as following.

- Option

  - returnFlat: Returns flatten array not tree structured array with `children`.
  - returnTree: Return tree structured array linked with `children`

- Example

```Javascript
const list = [{val: 1}, {val: 2, children: [{val: 3}]}];
const callback = (item) => ({ ...item, double: item.val * 2 });

const listMapped = list.map(callback);
const listFlatMapped = DoTree.map(list, TreeMapOptions.returnFlat, callback);
const listTreeMapped = DoTree.map(list, TreeMapOptions.returnTree, callback);

console.log(listMapped); // [{val: 1, double: 2}, {val: 2, double: 4, children: [{val: 3}]}]
console.log(listFlatMapped); // [{val: 1, double: 2}, {val: 2, double: 4}, {val: 3, double: 6}]
console.log(listTreeMapped); // [{val: 1, double: 2}, {val: 2, double: 4, children: [{val: 3, double: 6}]}]
```

### find

Same with `find` of Javascript except searching deeply through `children` property.

- Example

```Javascript
const list = [{a: 1}, {a: 2, children: [{a: 3}]}];
const callback = (item) => item.a === 3;

const listFound = list.find(callback);
const listTreeFound = DoTree.find(list, callback);

console.log(listFound); // undefined
console.log(listTreeFound); // {a: 3}
```

### findIndex

Same with `find` of Javascript except

1. Search deeply through `children` property.

2. Return value has full path in array when found, 0 length array when not found.

- Example

```Javascript
const list = [{a: 1}, {a: 2, children: [{a: 3}]}];
const callback = (item: any) => item.a === 3;

const indexFound = list.findIndex(callback);
const indexTreeFound = DoTree.findIndex(list, callback);

console.log(indexFound); // -1
console.log(indexTreeFound); // [1, 0] second item in first level, first item in second level
```

### some

Same with `some` of Javascript except search deeply through `children` property.

- Example

```Javascript
const list = [{a: 1}, {a: 2, children: [{a: 3}]}];
const callback = (item) => item.a === 3;

const listFound = list.some(callback);
const listTreeFound = DoTree.some(list, callback);

console.log(listFound); // false
console.log(listTreeFound); // true
```

### filter

Same with `filter' of Javascript except

1. Search deeply through `children` property.

2. There's three options which affect to result as following.

- Option

  - returnFlat: Returns flatted array not tree structured array with `children`.
  - returnTree: Returns tree structured array with `children`. Child item will not be searched and excluded from result when search stopped at parent because callback of parent returned false.
  - returnTreeRespectChildren: Returns tree structured array linked with `children`. Child item will be searched and can be included by callback result even if parent callback returned false. Returned array include found child and also not found parent to keep full path of hierarchy.

- Example

```Javascript
const list = [
    {a: 1},
    {a: 2,  children: [
              {a: 3,  children: [
                        {a: 4}
                      ]
              }
            ]
    }
  ];

const callback1 = (item) => item.a <= 2;

const found1 = DoTree.filter(list, TreeFilterOptions.returnFlat, callback1);
console.log(found1); // [{a: 1, children: undefined}, {a: 2, children: undefined}]

const found2 = DoTree.filter(list, TreeFilterOptions.returnTree, callback1);
console.log(found2); // [{a: 1, children: []}, {a: 2, children: []}]

const found3 = DoTree.filter(list, TreeFilterOptions.returnTreeRespectChildren, callback1);
console.log(found3); // [{a: 1, children: []}, {a: 2, children: []}]


const callback2 = (item) => item.a >= 3;

const found4 = DoTree.filter(list, TreeFilterOptions.returnFlat, callback2);
console.log(JSON.stringify(found4)); // [{a: 3}, {a: 4}]

// Stopped searching at second item because callback returns false at there.
const found5 = DoTree.filter(list, TreeFilterOptions.returnTree, callback2);
console.log(JSON.stringify(found5)); // []

// Continued to searching after second item because it has children, and included second item even if it was not found because one of children has found.
const found6 = DoTree.filter(list, TreeFilterOptions.returnTreeRespectChildren, callback2);
console.log(JSON.stringify(found6)); // [{a: 2, children: [{a: 3, children: [{a: 4, children: []}]}]}]
```

## Test

Do test to all functions and throw error when failed.

- Example

```bash
yarn test
```
