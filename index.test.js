/**
 * Simple custom testing method, instead of importing a testing framework
 * If you see an ERROR in your console, then something is broken.
 */
const expect = (it, seq) => {
  const robot = parser(seq);
  let result;
  // assigns REPORT to result
  instructions.REPORT(robot, {log: str => result = str});
  return {
    toBe(expected) {
      if (result !== expected) {
        console.error(`it '${it}' expected ${expected} == ${result}`);
      }
    },
  };
};

const tests = () => {
  let seq;
  // -------- SAMPLES TESTS
  seq =
    `PLACE 0,0,NORTH
     MOVE
     REPORT`;
  expect("one north", seq).toBe("0,1,NORTH");

  seq =
    `PLACE 0,0,NORTH
     LEFT
     REPORT`;
  expect("one rotate left", seq).toBe("0,0,WEST");

  seq =
    `PLACE 1,2,EAST
     MOVE
     MOVE
     LEFT
     MOVE
     REPORT`;
  expect("short walk", seq).toBe("3,3,NORTH");

  // --------- LONG WALK
  seq =
    `PLACE 0,0,NORTH
     MOVE
     MOVE
     MOVE
     MOVE
     RIGHT
     MOVE
     MOVE
     MOVE
     MOVE
     RIGHT
     MOVE
     MOVE
     MOVE
     MOVE
     RIGHT
     MOVE
     MOVE
     MOVE
     MOVE
     RIGHT
     REPORT`;
  expect("walk around the outside", seq).toBe("0,0,NORTH");

  // -------- ROBOT DOES NOT FALL OFF EDGE
  seq =
    `PLACE 3,0,SOUTH
     MOVE
     REPORT`;
  expect("no movement south", seq).toBe("3,0,SOUTH");
  seq =
    `PLACE 0,0,WEST
     MOVE
     REPORT`;
  expect("no movement west", seq).toBe("0,0,WEST");
  seq =
    `PLACE 4,4,NORTH
     MOVE
     REPORT`;
  expect("no movement south", seq).toBe("4,4,NORTH");
  seq =
    `PLACE 4,2,EAST
     MOVE
     REPORT`;
  expect("no movement east", seq).toBe("4,2,EAST");

  // -------- ROBOT CAN SPIN AROUND
  seq =
    `PLACE 4,2,EAST
     LEFT
     LEFT
     LEFT
     LEFT
     REPORT`;
  expect("360 spin LEFT", seq).toBe("4,2,EAST");
  seq =
    `PLACE 4,2,EAST
     RIGHT
     RIGHT
     RIGHT
     RIGHT
     REPORT`;
  expect("360 spin RIGHT", seq).toBe("4,2,EAST");

  // -------- PLACE TESTS
  seq =
    `RIGHT
     LEFT
     MOVE
     REPORT`;
  expect("ignores commands before PLACE", seq).toBe(null);

  seq =
    `PLACE 2,2,EAST
     LEFT
     MOVE
     REPORT
     PLACE 0,0,EAST
     MOVE`;
  expect("tests state after PLACE command", seq).toBe("1,0,EAST");

  // -------- BAD DATA
  seq =
    `PLACE A,2,EAST`;
  expect("ignores bad place command", seq).toBe(null);

  seq =
    `PLACE 5,2,EAST
     PLACE -1,2,EAST
     PLACES 1,2,EAST

     PLACE 1,5,EAST
     PLACE 1,-1,EAST
     PLACE 1,ONE,EAST

     PLACE 1,1,EASTS
     PLACE 1,1,E`;
  expect("ignores bad place commands", seq).toBe(null);

  seq =
    `PLACE 2,2,EAST
     LEFTT
     PLAC 1,1,EAST
     MOVEME
     MOVE
     REPORT`;
  expect("ignores bad commands", seq).toBe("3,2,EAST");

  // -------- ENSURES JAVASCRIPT PROTOTYPES METHODS WONT BREAK OUR ROBOT
  seq =
    `PLACE 0,0,NORTH
     toString 1234
     MOVE
     REPORT`;
  expect("ignores javascript prototypes commands", seq).toBe("0,1,NORTH");
};

// run all tests
tests();
