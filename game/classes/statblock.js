const BASE_STATS = [
    {
        "name": "gnome",
        "hp": 100,
        "mhp": 100,
        "regen": .2,
        "attack": 2,
        "magic": 1,
        "mp": 100,
        "mmp": 100,
        "magicResistance": 2,
        "luck": 10,
        "credit": 1,
        "hearing": 1,
        "speakingRange": 2,
        "Fear": 1,
        "powerLevel": 1,
        "handDigSpeed": 0.05,
        "runningSpeed": 1
    },
    {
        "name": "aylah",
        "hp": 100,
        "mhp": 100,
        "regen": .1,
        "attack": 1,
        "magic": 5,
        "mp": 150,
        "mmp": 150,
        "magicResistance": 10,
        "luck": 1,
        "credit": 1,
        "hearing": 10,
        "speakingRange": 1,
        "Fear": 1,
        "powerLevel": 1,
        "handDigSpeed": 0.07,
        "runningSpeed": 1
    },
    {
        "name": "skizzard",
        "hp": 100,
        "mhp": 100,
        "regen": .5,
        "attack": 1,
        "magic": 1,
        "mp": 100,
        "mmp": 100,
        "magicResistance": 1,
        "luck": 1,
        "credit": 1,
        "hearing": 5,
        "speakingRange": 1,
        "Fear": 2,
        "powerLevel": 1,
        "handDigSpeed": 0.08,
        "runningSpeed": 1
    }
]
class StatBlock{
    constructor(race, health){
        this.race = race;
        this.stats = JSON.parse(JSON.stringify(BASE_STATS[this.race]));
        if(health != undefined) this.stats.hp = health;
        this.level = 0;
        this.xp = 0;
        this.xpNeeded = 10;
    }

    heal(amount) {
        this.stats.hp = this.stats.hp + amount;

        if(this.stats.hp > this.stats.mhp) {
            this.stats.hp = this.stats.mhp;
        }

        socket.emit("update_player", {
            id: curPlayer.id,
            pos: curPlayer.pos,
            holding: curPlayer.holding,
            update_names: ["stats.hp"],
            update_values: [this.stats.hp]
        });
    }

    addXP(amount){
        this.xp += amount;
        if(this.xp > this.xpNeeded){
            this.xp = 0;
            this.level ++;
            this.xpNeeded *= 2;

            this.updateStats(this.level);
        }
    }

    updateStats(lvl){
        this.level = lvl;
        this.runningSpeed += 0.1;
    }
}