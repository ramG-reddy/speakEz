type HandleInputArgs = {
  currHighlithedNav: string;
  array: any;
  index: number;
  numCols: number;
  onAction: () => any;
}

export const handleInput = ({
  currHighlithedNav,
  array,
  index,
  numCols,
  onAction,
}: HandleInputArgs) => {
  if(index >= array.length) {
    throw Error("Invalid Index Recieved");
  }

  let nextIndex = index;
  switch (currHighlithedNav) {
    case "up":
      nextIndex = (index - numCols + array.length) % array.length;
      break;
    case "down":
      nextIndex = (index + numCols) % array.length;
      break;
    case "left":
      nextIndex = (index - 1 + array.length) % array.length;
      break;
    case "right":
      nextIndex = (index + 1) % array.length;
      break;
    case "action":
      onAction();
      break;
  }
  return nextIndex;
};
