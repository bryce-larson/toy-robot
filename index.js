/**
 * Notes:
 *  - Written by Bryce Larson on November 17, 2016
 *  - This is written and tested for Chrome 54+ and Firefox 49+
 *  - For cross browser support transpile the code using Bable
 */

const MAX_X = 5;  // 0 west  -> east
const MAX_Y = 5;  // 0 south -> north
const DIRECTIONS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];  // Never Eat Soggy Wheat

// helper method for rotating the robot
const rotate = (direction, clockwise) => {
  let ix = DIRECTIONS.indexOf(direction);
  // direction might be undefined, if PLACE has not occured
  // this is one of those js tricks, that the entire team needs to agree to use
  if (~ix) {
    // adding length fixes issue with negative mod in JS
    ix = (ix + (clockwise ? 1 : -1) + DIRECTIONS.length) % DIRECTIONS.length;
    return DIRECTIONS[ix];
  } else {
    return direction;
  }
};
/**
 * List of validate commands a robot can take.
 *
 * robot is an object of structure = { x, y, f }
 *    - x - is the east / west position
 *    - y - is the north / south position
 *    - f - is the direction or face the robot is pointing
 */
const instructions = {
  PLACE (robot, place) {
    const [x, y, f] = place.split(',');
    if ( x >= 0 && x < MAX_X
      && y >= 0 && y < MAX_Y
      && DIRECTIONS.includes(f)) {
      return {x: +x, y: +y, f};
    } else {
      return robot;
    }
  },
  MOVE (robot) {
    const {x, y, f} = robot;
    if (f) {
      const makeMove = {
        // checks if the robot will fall before it is allowed to move
        WEST()  { return x > 0 ? {x: x - 1} : {} },
        SOUTH() { return y > 0 ? {y: y - 1} : {} },
        EAST()  { return x < MAX_X - 1 ? {x: x + 1} : {} },
        NORTH() { return y < MAX_Y - 1 ? {y: y + 1} : {} },
      };
      return Object.assign(robot, makeMove[f]());
    } else {
      return robot;
    }
  },
  LEFT (robot) {
    const f = rotate(robot.f, false);
    return Object.assign(robot, {f});
  },
  RIGHT (robot) {
    const f = rotate(robot.f, true);
    return Object.assign(robot, {f});
  },
  REPORT (robot, logger = console) {
    const {x, y, f} = robot;
    logger.log( f ? `${x},${y},${f}` : null);  // logs null for empty state
    return robot;
  },
};

/**
 * Input is a sequence of commands, separated by new lines, for our robot to take,
 * If we had module export support, EXPORT this function
 */
function parser(input) {
  const lines = input.split("\n");
  return lines.reduce((robot, line) => {
    const [cmd, args] = line.trim().split(' ');  // trims lines for easier input
    if (instructions.hasOwnProperty(cmd)) {      // ignores invalid cmds
      robot = instructions[cmd](robot, args);    // functional
    }
    return robot;
  }, {});  // robot initialized to empty object
};

// --------------------------------------------------------------
// ----- testing, this should be in another file  ---------------

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
