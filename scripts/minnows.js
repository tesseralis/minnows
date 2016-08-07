const counts = [1, 1, 2, 5, 12, 35]

const canvasLength = 960
const ringSpacing = 75
const blockSize = 8

const svg = d3.select('body').append('svg')
  .attr('width', canvasLength)
  .attr('height', canvasLength)

// Draw the minos for each generation
function drawPolyominoes(element, polyominoes, links) {
  const diagram = element.append('g').classed('diagram', true)
    .attr('transform', `translate(${canvasLength/2} ${canvasLength/2})`)

  // Draw the concentric orbital rings
  diagram.append('g').classed('orbitals', true).selectAll('circle.orbital')
    .data(d3.range(polyominoes.length))
    .enter().append('circle').classed('ring', true)
    .attr('r', d => d * ringSpacing)
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('data-generation', d => d + 1)

  // Draw groups for each generation
  const generations = diagram.append('g').classed('generations', true)
    .attr('transform', 'rotate(-90)')
    .selectAll('.generation')
    .data(polyominoes)
    .enter().append('g')
    .classed('generation', true)
    .attr('data-generation', (d, i) => i + 1)

  function transform(mino, i) {
    genIndex = mino.length -1
    // TODO it feels dirty referencing the parent element like this
    numMinosInGen = polyominoes[genIndex].length
    radius = genIndex * ringSpacing
    x = radius * Math.cos(i/numMinosInGen * 2 * Math.PI)
    y = radius * Math.sin(i/numMinosInGen * 2 * Math.PI)
    return `translate(${x} ${y})`
  }

  const minos = generations.selectAll('.mino')
    .data(generation => generation)
    .enter().append('g')
    .classed('mino', true)
    .attr('transform', transform)

  // Draw the squares on each polyomino
  minos.selectAll('rect.block')
    .data(mino => mino)
    .enter().append('rect').classed('block', true)
    .attr('width', blockSize)
    .attr('height', blockSize)
    .attr('x', d => d[0] * blockSize)
    .attr('y', d => d[1] * blockSize)

  // Draw links between parent and child
  const curve = d3.radialLine()
    .radius(d => d.radius)
    .angle(d => d.angle)
    .curve(d3.curveBasis)

  function radiusAndAngle([gen, i]) {
    const radius = gen * ringSpacing
    const angle = i/polyominoes[gen].length * 2*Math.PI
    return {radius, angle}
  }

  const avg = (a, b) => (a+b)/2
  function avgAngle(a, b) {
    const x = Math.abs(a - b)
    const result = x < Math.PI ? (a + b)/2 : (a + b)/2 + Math.PI
    return result % (2*Math.PI)
  }

  function spline({source, target}) {
    const src = radiusAndAngle(source)
    const tgt = radiusAndAngle(target)

    const midRad = avg(src.radius, tgt.radius)
    const midAngle = avgAngle(src.angle, tgt.angle)
    return [src, {radius: midRad, angle: midAngle}, tgt]
  }
    
  diagram.append('g').classed('links', true).selectAll('path.link')
    .data(links.map(spline))
    .enter().append('path').classed('link', true)
    .attr('d', curve)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
}

d3.json('data/minos.json', (data) => {
  const {nodes, links} = data
  drawPolyominoes(svg, nodes, links)
})
