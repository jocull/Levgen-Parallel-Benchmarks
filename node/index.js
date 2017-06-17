// This program was ported from the C# version
const os = require('os');

const TileType = {
  Rock: 0,
  Room: 1,
};

class Tile {
 constructor() {
    this.type = TileType.Rock;
  } 
}

class Room {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  intersects(otherRoom) {
    let roomDoesntIntersect =
      (this.x + this.w + 1) < otherRoom.x
      || this.x > (otherRoom.x + otherRoom.w + 1)
      || (this.y + this.h + 1) < otherRoom.y
      || this.y > (otherRoom.y + otherRoom.h + 1);

    return !roomDoesntIntersect;
  }
}

class Level {
  constructor(numRooms, tileDim) {
    this._rooms = [];
    this._tileDim = tileDim;
    
    this._tiles = Array(tileDim * tileDim);
    for (let i = 0; i < this._tiles.length; i++) {
      this._tiles[i] = new Tile();
    }
  }

  numberOfRooms() {
    return this._rooms.length;
  }

  static generateTilesForRoom(room, ts, tileDim) {
    let x = room.x;
    let y = room.y;
    let w = room.w;
    let h = room.h;

    for (let xi = x; xi <= x + w; xi++) {
      for (let yi = y; yi < y + h; yi++) {
        let num = yi * tileDim + xi;
        ts[num].type = TileType.Room;
      }
    }
  }

  intersectsExistingRooms(room) {
    for (let r of this._rooms) {
      if (r.intersects(room)) {
        return true;
      }
    }
    return false;
  }

  tryAddRoom(room) {
    if (!this.intersectsExistingRooms(room)) {
      this._rooms.push(room);
      Level.generateTilesForRoom(room, this._tiles, this._tileDim);
      return true;
    }
    return false;
  }

  toString() {
    const tiles = this._tiles;
    const sb = [];
    const dim = this._tileDim;
    const sq = dim * dim;
    const wid = dim - 1;
    for (let i = 0; i < sq; i++) {
      sb.push(tiles[i].type);
      if (i % dim == wid
          && i != 0) {

        sb.push(os.EOL);
      }
    }
    return sb.join('');
  }
}

class GenRand {
  constructor(seed) {
    // Force integer
    this._gen = ~~seed;
  }

  next() {
    let gen = this._gen;
    gen += gen;
    gen ^= 1;
    if (gen < 0) {
      gen ^= 0x88888eef;
    }
    this._gen = gen;
    return gen;
  }
}

class LevelSettings {
  constructor(maxRooms, tileDim, restWidMax, widMin, roomInsertionAttempts) {
    this.maxRooms = maxRooms;
    this.tileDim = tileDim;
    this.restWidMax = restWidMax;
    this.widMin = widMin;
    this.roomInsertionAttempts = roomInsertionAttempts;
  }
}

class LevelMaker {
  constructor(seed) {
    this._rand = new GenRand(seed);
  }

  // Explicit level count instead of generator function
  makeLevels(settings, levelCount) {
    let results = [];
    for (let i = 0; i < levelCount; i++) {
      let lev = new Level(settings.maxRooms, settings.tileDim);

      let roomCount = 0;
      for (let attempt = 0; attempt < settings.roomInsertionAttempts; attempt++) {
        let x = this._rand.next() % settings.tileDim;
        let y = this._rand.next() % settings.tileDim;
        let w = this._rand.next() % settings.restWidMax + settings.widMin;
        let h = this._rand.next() % settings.restWidMax + settings.widMin;

        if (x + w >= settings.tileDim
            || y + h >= settings.tileDim
            || x == 0
            || y == 0) {
          
          continue;
        }

        let room = new Room(x, y, w, h);
        if (lev.tryAddRoom(room))
        {
          if (++roomCount == settings.maxRooms) {
            break;
          }
        }
      }
      results.push(lev);
    }
    return results;
  }
}

// Main entry
(function() {
  const present = require('present'); // for stopwatch
  const startMs = present();

  const numLevels = 800;
  const numThreads = os.cpus().length;
  const levelsPerThread = numLevels / numThreads;

  const seed = Math.abs(parseInt(process.argv[2])); // node, path.js, [arg1, arg2, ...]

  const levelSettings = new LevelSettings(99, 50, 8, 2, 50000);
  console.log(`The random seed is: ${seed}`);

  // Simulate threads for now
  let levels = [];
  for (let threadId = 0; threadId < numThreads; threadId++) {
    const threadSeed = seed*(threadId + 1)*(threadId + 1);
    console.log(`The seed for thread ${threadId} is: ${threadSeed}`);
    
    const levelMaker = new LevelMaker(threadSeed);
    const _levels = levelMaker.makeLevels(levelSettings, levelsPerThread);
    levels = levels.concat(_levels);
  }

  levels.sort((a, b) => {
    return b.numberOfRooms() - a.numberOfRooms();
  });

  let bestLevel = levels[0];

  console.log(bestLevel.toString());
  
  const endMs = present();
  console.log(Math.round(endMs - startMs));
})();
