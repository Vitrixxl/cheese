How to solve this fucking recursion probleme ?


First i need to create a proper tree and ensure that it's working perfectly, for this here's an example of the output type :

```ts
type GameTree = {
  // Only null when it's root
  move : string | null
  color : Color | null
  // For the moment we do not care that much about that because it's will not be used yet
  eval : EvalOutput | null
  // This will contains the next calculated / played branches
  branches : GameTree[]
}
```

When we managed to get a proper GameTree we have to display it in React.

How should we do this ?

First of all we need to get a kind of array such as :

```ts
type MovePairMove = {
  move : string
  color: Color
  eval : EvalOutput | null
}
```
```ts
type MovePair = {
    index:number;
    whiteMove: MovePairMove
    whiteBranches: MovePair[]  // variations après le coup blanc
    blackMove?: MovePairMove       // optionnel si pas de réponse
    blackBranches: MovePair[]  // variations après le coup noir
}
```

Then we have to make a component that can render the moves, the continuation and the branches
For that the component props should be :
```ts
type GameTreeComponentProps = {
  pairs : MovePair[]
  // 0 at root
  moveNumber : number
  isRoot: boolean
}
```

Why does isRoot is necessary ? We need it in order to put a flex-col at the root and a flex-wrap for the others branches

Then the component will render like that :

```tsx
<div className={cn("flex",isRoot ? "flex-col":"flex-wrap")}>
  {
    pairs.map(({whiteMove,blackMove,whiteBranches, blackBranches,index})=>(
      <div>

        <div className={"flex gap-2"}>
          {index}.
          <MovePairMove move={whiteMove}/>
          <MovePairMove move={blackMove}/>
        </div>

        {whiteBranches.lenght>0 && (<GameTreeComponent pairs={whiteBranches} isRoot={false} />)}
        {blackBranches.lenght>0 && (<GameTreeComponent pairs={whiteBranches} isRoot={false} />)}
      </div>
    ))
  }
</div>
```

