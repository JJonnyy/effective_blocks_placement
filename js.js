// #
// The next step to optimize and improve performance
// will be to create whole blocks by coordinates at once and render them afterwards

let response = await fetch('./data.json')
let data = await response.json()

const container = data.container;
const blocks = data.blocks;

function efficientPlacement(blocks, container) {

  // Sort blocks
  console.log('blocks', blocks)
  console.log('container', container)
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  // Initialize container grid
  const grid = Array.from({ length: container.height }, () =>
    Array(container.width).fill(0)
  );

  // check valid position
  function isValidPosition(x, y, block) {
    for (let i = 0; i < block.height; i++) {
      for (let j = 0; j < block.width; j++) {
        if (grid[y + i] && grid[y + i][x + j] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  // place a block
  function placeBlock(x, y, block, order) {
    for (let i = 0; i < block.height; i++) {
      for (let j = 0; j < block.width; j++) {
        grid[y + i][x + j] = order;
      }
    }
    block.order = order;
    console.log('Block',block);
  }

  let order = 1;
  let fullness = 0;

  for (const block of blocks) {
    let placed = false;

    for (let rotate = 0; rotate < 2; rotate++) {
      for (let y = 0; y <= container.height - block.height; y++) {
        for (let x = 0; x <= container.width - block.width; x++) {
          if (isValidPosition(x, y, block)) {
            placeBlock(x, y, block, order);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (placed) break;
      [block.width, block.height] = [block.height, block.width];
    }

    // Update fullness
    fullness = 0;
    for (let i = 0; i < container.height; i++) {
      for (let j = 0; j < container.width; j++) {
        if (grid[i][j] === 0) {
          fullness++;
        } 
      }
    }
    order++;
  }
  const totalArea = container.width * container.height;
  const fullnessFactor = 1 - fullness / totalArea;

  // Coordinates
  const blockCoordinates = [];
  for (let i = 0; i < container.height; i++) {
    for (let j = 0; j < container.width; j++) {
      const blockOrder = grid[i][j];
      if (blockOrder !== 0) {
        const block = blocks.find((b) => b.order === blockOrder);
        blockCoordinates.push({
          top: i,
          left: j,
          right: block.width - j,
          bottom: (i + block.height),
          initialOrder: block.order,
        });
      }
    }
  }
  return {
    fullness: fullnessFactor,
    blockCoordinates
  };
}

const result = efficientPlacement(blocks, container);

function renderBlocks() {
  const containerElement = document.getElementById('container');
  containerElement.style.width = container.width + 'px';
  containerElement.style.height = container.height + 'px';
  containerElement.innerHTML = '';

  const fullnessElement = document.createElement('div');
  fullnessElement.classList.add('description');
  fullnessElement.innerText = `Fullness Factor: ${result.fullness.toFixed(2)}`;
  containerElement.appendChild(fullnessElement);

  result.blockCoordinates.forEach((block) => {
    const blockElement = document.createElement('div');
    blockElement.className = 'block';
    blockElement.style.top = `${block.top}px`;
    blockElement.style.left = `${block.left}px`;
    blockElement.style.width = `${1}px`;
    blockElement.style.height = `${1}px`;
    blockElement.setAttribute("order", block.initialOrder.toString())
    containerElement.appendChild(blockElement);
  });

  // paintBlocks
  let blocksBackground = [];
  for (let i = 0; i < blocks.length + 1  ; i++) {
    blocksBackground.push(`rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`);
  }
  let blocksElement = document.querySelectorAll('.block')

  for (let i = 0; i < blocks.length + 1; i++) {
    blocksElement.forEach(item =>{
      let itemOrder = item.getAttribute('order')
      if(itemOrder == i){
        item.style.background = blocksBackground[i];
      }
    })
  }
}

renderBlocks();



