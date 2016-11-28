/**
 * @author Bryce Larson
 *
 * This is written and tested for Chrome 54+ and Firefox 49+
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