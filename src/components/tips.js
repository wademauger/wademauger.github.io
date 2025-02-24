const funFacts = [
  'You can create a simple textured fabric using a tuck stitch. Setup your machine for partial knitting, and put every 4th needle in hold. Knit 3 rows. Set your machine to knit all working needles, knit one row, and set your machine back to partial knitting. Now, select the alternate set of 4th needles and repeat.',
  'You can knit in 2 or more colors using partial knitting. with the carriage on the right, hold all the needles marked in a different color from the yarn in the carriage and set the carriage to slip these needles. Knit the row. Now, either move the carriage back and repeat with another color yarn, or knit the opposite color in by hand.',
  'Use the transfer tool to move stitches from one needle to another between rows. You can create lace, cables, and button holes easily with this method.',
  'With the intarsia carriage, you can make a fabric with unlimited different colors and yarns, without creating a thicker fabric than a single yarn.',
  'A ribbing attachment can be used to create purl stitches or knit in the round, but these projects can also be created by knitting flat panels and sewing them together, and by dropping stitches and reforming them into purls with the latch tool.',
  'Partial knitting or short rowing can be used to create pockets and loops. Hold one needle on the side opposite the carriage, knit across, and then wrap the yarn under the newly held needle. Either knit across everything or re-wrap one needle at a time, depending on the project. This can form earflaps on a hat, heels on socks, or the shaping on necklines and shoulders for sweaters.',
  'You can plait your knitting by holding two different yarns together and feeding them into the carriage. Combine colors or fibers this way.',
  'A loop-through-loop or latch tool bind off creates a beautiful "sideways V" edge. Increase your tension by at least 2 settings before doing this bind off.',
  'You can cast on your machine a few different ways for different projects. An E-wrap gives a nice edge that can stand on its own, while an every-other-needle cast on is better for hung-hem edges.',
  'Mock ribbing is easy, just move every 2nd or 3rd needle out of work, and set the tension down 2 settings tighter.'
];

function Tips() {
  const tip = funFacts[Math.floor(Math.random() * funFacts.length)];
  return (
    <p id="fun-fact" className="mt-2">
      <b>Did you know?</b> {tip}
    </p>
  );
}

export default Tips;