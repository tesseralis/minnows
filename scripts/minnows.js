const canvasLength = 700
const ringRadiusBase = 18
const blockSize = 8

// Utility functions
function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
function avg(...arr) { return sum(arr) / arr.length; }

function ringRadius(gen) {
  return ringRadiusBase * Math.pow(gen, 1.75);
}

const svg = d3.select('body').append('svg')
  .attr('width', canvasLength)
  .attr('height', canvasLength)

// Draw the minos for each generation
function drawPolyominoes(element, polyominoes, linkData) {
  const diagram = element.append('g').classed('diagram', true)
    .attr('transform', `translate(${canvasLength/2} ${canvasLength/2})`)

  // Draw the concentric orbital rings
  diagram.append('g').classed('orbitals', true).selectAll('circle.orbital')
    .data(d3.range(polyominoes.length))
    .enter().append('circle').classed('orbital', true)
    .attr('r', ringRadius)
    .attr('data-generation', d => d + 1)

  // Draw links between parent and child
  const curve = d3.radialLine()
    .radius(d => d.radius)
    .angle(d => d.angle)
    .curve(d3.curveBasis)

  function radiusAndAngle([gen, i]) {
    const radius = ringRadius(gen)
    const angle = i/polyominoes[gen].length * 2*Math.PI
    return {radius, angle}
  }

  function avgAngle(a, b) {
    const x = Math.abs(a - b)
    const result = x < Math.PI ? (a + b)/2 : (a + b)/2 + Math.PI
    return result % (2*Math.PI)
  }

  // Add a third value in between the edges so we have a curve
  function spline({source, target}) {
    const src = radiusAndAngle(source)
    const tgt = radiusAndAngle(target)

    const midRad = avg(src.radius, tgt.radius)
    const midAngle = avgAngle(src.angle, tgt.angle)
    return [src, {radius: midRad, angle: midAngle}, tgt]
  }
    
  const links = diagram.append('g').classed('links', true)
  const link = links.selectAll('path.link')
    .data(linkData)
    .enter().append('path').classed('link', true)
    .attr('d', d => curve(spline(d)))

  // Draw groups for each generation
  const generations = diagram.append('g').classed('generations', true)
    .attr('transform', 'rotate(-90)')
  const generation = generations.selectAll('.generation')
    .data(polyominoes)
    .enter().append('g')
    .classed('generation', true)
    .attr('data-generation', (d, i) => i + 1)

  function transform(mino, i) {
    genIndex = mino.length -1
    // TODO it feels dirty referencing the parent element like this
    numMinosInGen = polyominoes[genIndex].length
    radius = ringRadius(genIndex)
    x = radius * Math.cos(i/numMinosInGen * 2 * Math.PI)
    y = radius * Math.sin(i/numMinosInGen * 2 * Math.PI)
    return `translate(${x} ${y})`
  }

  const minoWrapper = generation.selectAll('.mino-wrapper')
    .data(generation => generation)
    .enter().append('g')
    .classed('mino-wrapper', true)
    .attr('transform', transform)

  // Center the mino on 0,0
  function translateMino(mino) {
    const xAvg = avg(...mino.map(c => c[0]))
    const yAvg = avg(...mino.map(c => c[1]))
    const translate = (x) => -x * blockSize - blockSize/2
    return `translate(${translate(xAvg)} ${translate(yAvg)})`
  }

  const mino = minoWrapper.append('g').classed('mino', true)
    .attr('transform', translateMino)
    .on('mouseover', function(d, i) {
      d3.select(this).selectAll('.block').classed('isFocused', true)

      const gen = d.length - 1

      link.classed('isFocused', ({source, target}) => {
        return source[0] === gen && source[1] === i ||
               target[0] === gen && target[1] === i
      })
    })
    .on('mouseout', function(d, i) {
      d3.select(this).selectAll('.block').classed('isFocused', false)
      link.classed('isFocused', false)
    })

  // Draw the squares on each polyomino
  const block = mino.selectAll('rect.block')
    .data(mino => mino)
    .enter().append('rect').classed('block', true)
    .attr('width', blockSize)
    .attr('height', blockSize)
    .attr('x', d => d[0] * blockSize)
    .attr('y', d => d[1] * blockSize)
}

d3.json('data/minos.json', (data) => {
  const {nodes, links} = data
  drawPolyominoes(svg, nodes, links)
})
