const canvasLength = 800
const ringRadiusBase = 80
const blockSize = 8

// Utility functions
function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
function avg(...arr) { return sum(arr) / arr.length; }
function avgAngle(a, b) {
  const x = Math.abs(a - b)
  const result = x < Math.PI ? (a + b)/2 : (a + b)/2 + Math.PI
  return result % (2*Math.PI)
}
function avgPolar(a, b) {
  const radius = avg(a.radius, b.radius)
  const angle = avgAngle(a.angle, b.angle)
  return {radius, angle}
}
function polarToCartesian(r, theta) {
  return [radius * Math.cos(theta), radius * Math.sin(theta)]
}

const svg = d3.select('body').append('svg')
  .attr('width', canvasLength)
  .attr('height', canvasLength)

// Draw the given list of polyominoes on the given element
function drawPolyominoes(element, polyominoes, linkData) {
  const numGenerations = polyominoes.length

  function ringRadius(gen) {
    return ringRadiusBase * Math.tan(gen / numGenerations * Math.PI / 2)
  }

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
    .curve(d3.curveNatural)

  function radiusAndAngle([gen, i]) {
    const radius = ringRadius(gen)
    const angle = i/polyominoes[gen].length * 2*Math.PI
    return {radius, angle}
  }

  function interpolatePolar(a, b, n=0) {
    const half = avgPolar(a, b)
    if (n === 0) {
      return [half]
    } else {
      return [...interpolatePolar(a, half, n-1), half, ...interpolatePolar(half, b, n-1)]
    }
  }

  // Add inbetween values in between the edges so we have a curve
  function spline({source, target}) {
    const src = radiusAndAngle(source)
    const tgt = radiusAndAngle(target)
    return [src, ...interpolatePolar(src, tgt, 5), tgt]
  }
    
  const links = diagram.append('g').classed('links', true)
  const link = links.selectAll('path.link')
    .data(linkData)
    .enter().append('path').classed('link', true)
    .attr('d', d => curve(spline(d)))
    .attr('data-generation', d => d.source[0] + 1)

  // Draw groups for each generation
  const generations = diagram.append('g').classed('generations', true)
    .attr('transform', 'rotate(-90)')
  const generation = generations.selectAll('.generation')
    .data(polyominoes)
    .enter().append('g')
    .classed('generation', true)
    .attr('data-generation', (d, i) => i + 1)

  // Put the mino in the right position on the graph
  const minoWrapper = generation.selectAll('.minoWrapper')
    .data(generation => generation)
    .enter().append('g')
    .classed('minoWrapper', true)
    .attr('transform', (mino, i, siblings) => {
      radius = ringRadius(mino.length - 1)
      angle = i/siblings.length * 2 * Math.PI
      return `translate(${polarToCartesian(radius, angle).join(',')}) rotate(90)`
    })

  const mino = minoWrapper.append('g').classed('mino', true)
    .on('mouseover', function(d, i) {
      d3.select(this).classed('isFocused', true)
      const gen = d.length - 1
      const hasNode = (d) => d[0] === gen && d[1] === i
      link.classed('isFocused', ({source, target}) => hasNode(source) || hasNode(target))
    })
    .on('mouseout', function(d, i) {
      d3.select(this).classed('isFocused', false)
      link.classed('isFocused', false)
    })

  // Translate so that the mino is centered
  const minoInner = mino.append('g').classed('minoInner', true)
    .attr('transform', (mino) => {
      const xAvg = avg(...mino.map(c => c[0]))
      const yAvg = avg(...mino.map(c => c[1]))
      const translate = (x) => -x * blockSize - blockSize/2
      return `translate(${translate(xAvg)},${translate(yAvg)})`
    })

  // Draw the squares on each polyomino
  const block = minoInner.selectAll('rect.block')
    .data(mino => mino)
    .enter().append('rect').classed('block', true)
    .attr('width', blockSize)
    .attr('height', blockSize)
    .attr('x', d => d[0] * blockSize)
    .attr('y', d => d[1] * blockSize)

  // Make the diagram visible
  const diagramTransition = d3.transition()
    .duration(1000)
    .ease(d3.easeLinear)

  diagram.attr('opacity', 0)
    .transition(diagramTransition)
    .attr('opacity', 1)
}

d3.json('data/minos.json', (data) => {
  drawPolyominoes(svg, data.nodes, data.links)
})
