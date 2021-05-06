# DoTree

- [README English](README.md)

Parent, Child 구조를 가지는 배열(Menu, Table의 Sub Table 등)에서 필요한 함수 구현.

모든 하위 항목은 상위 항목의 배열 형식인 `children` 속성에 속해 있다고 가정함.
만약 `children` 속성이 아닌 다른 속성을 사용한다면 `changeToChildrenProp` 함수를 이용해 `children` 속성으로 변경할 수 있음.

## 설치

```bash
npm install do-tree
yarn add do-tree
```

## 문제점

Javascript의 `map`, `find`, `filter`, `some`은 1레벨의 배열의 항목에 대해서만 기능함.
예를 들어 다음은 name이 a, b, c인 목록 중에 name이 b인 것을 제외한 목록을 리턴함.

```Javascript
const list = [
    { name: 'a' },
    { name: 'b' },
    { name: 'c' }
];
const filtered = list.filter(item => item !== item.name !== 'b');
console.log(filtered); // [ { name: 'a' }, { name: 'c' } ]
```

그러나 다음과 같이 `children`으로 정의된 하위 목록에 대해서도 filter를 하려면 기본 함수로 구현이 어려움.

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

## 해결책

다음과 같이 DoTree 클래스를 이용하도록 구현.

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
const filtered = DoTree.filter(list, TreeFilterOptions.returnTree, (item => item !== item.name !== 'b'));
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

하위 목록을 가진 속성 이름을 표준 이름인 `children`으로 변경.

- 예제

```Javascript
const list = [ path: '/test', routes: [ path: '/test2' ] ];
const listNew = DoTree.changeToChildrenProp(list, 'routes');
console.log(listNew); // [ path: '/test', children: [ path: '/test2' ] ]
```

### map

다음 2가지를 제외하면 Javascript의 `map`과 동일.

1. `children` 속성을 따라 하위 레벨까지 검색

2. 결과를 결정하는 다음 2개의 옵션이 존재

- 옵션

  - returnFlat: `children`으로 연결된 Tree 구조가 아닌 Flat한 배열 목록을 리턴함.
  - returnTree: `children`으로 연결된 Tree 구조를 리턴함.

- 예제

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

`children` 속성을 따라 하위 레벨까지 검색하는 것을 제외하면 Javascript의 `find`와 동일

- 예제

```Javascript
const list = [{a: 1}, {a: 2, children: [{a: 3}]}];
const callback = (item) => item.a === 3;

const listFound = list.find(callback);
const listTreeFound = DoTree.find(list, callback);

console.log(listFound); // undefined
console.log(listTreeFound); // {a: 3}
```

### findIndex

다음 2가지를 제외하면 Javascript의 `find`와 동일.

1. `children` 속성을 따라 하위 레벨까지 검색

2. 리턴 값은 찾아진 전체 경로를 배열로 리턴하며, 못 찾은 경우는 0길이 배열([])을 리턴함.

- 예제

```Javascript
const list = [{a: 1}, {a: 2, children: [{a: 3}]}];
const callback = (item: any) => item.a === 3;

const indexFound = list.findIndex(callback);
const indexTreeFound = DoTree.findIndex(list, callback);

console.log(indexFound); // -1
console.log(indexTreeFound); // [1, 0] second item in first level, first item in second level
```

### some

`children` 속성을 따라 하위 레벨까지 검색하는 것을 제외하면 Javascript의 `some`과 동일.

- 예제

```Javascript
const list = [{a: 1}, {a: 2, children: [{a: 3}]}];
const callback = (item) => item.a === 3;

const listFound = list.some(callback);
const listTreeFound = DoTree.some(list, callback);

console.log(listFound); // false
console.log(listTreeFound); // true
```

### filter

다음 2가지를 제외하면 Javascript의 `filter`와 동일함.

1. children 속성을 따라 하위 레벨까지 검색

2. 결과를 결정하는 다음 3개의 옵션이 존재

- 옵션

  - returnFlat: `children`으로 연결된 Tree 구조가 아닌 Flat한 배열 목록을 리턴함.
  - returnTree: `children`으로 연결된 Tree 구조를 리턴함. 만약 상위 항목의 callback 결과가 false를 리턴해서 검색이 중단되면 해당 항목의 `children` 목록도 검색하지 않아 결과에서 제외됨.
  - returnTreeRespectChildren: `children`으로 연결된 Tree 구조를 리턴함. 만약 상위 항목의 callback 결과가 false를 리턴해서 제외되었다라도 하위 항목 중 하나라도 callback 결과가 true를 리턴했다면 상위 항목은 구조를 유지하기 위해 검색 결과에 포함됨.

- 예제

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

전체 함수에 대한 테스트를 실행해서 실패한 경우 에러를 발생시킴.

- 예제

```bash
yarn test
```
