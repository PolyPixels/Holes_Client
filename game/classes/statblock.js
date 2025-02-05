const BASE_STATS = [
    {
        hp: 100,
        mhp: 100,
        regen: 1,
        attack: 2,
        magic: 1,
        magicResistance: 2,
        luck: 2,
        credit: 1,
        hearing: 1,
        speakingRange: 2,
        Fear: 1,
        powerLevel: 1,
        handDigSpeed: 0.05,
        runningSpeed: 1
    },
    {
        hp: 100,
        mhp: 100,
        regen: 1,
        attack: 1,
        magic: 2,
        magicResistance: 1,
        luck: 1,
        credit: 1,
        hearing: 2,
        speakingRange: 1,
        Fear: 1,
        powerLevel: 1,
        handDigSpeed: 0.07,
        runningSpeed: 1
    },
    {
        hp: 100,
        mhp: 100,
        regen: 2,
        attack: 1,
        magic: 1,
        magicResistance: 1,
        luck: 1,
        credit: 1,
        hearing: 1,
        speakingRange: 1,
        Fear: 2,
        powerLevel: 1,
        handDigSpeed: 0.08,
        runningSpeed: 1
    }
];

class StatBlock{
    constructor(race, health){
        this.race = race;
        this.stats = BASE_STATS[this.race];
        if(health != undefined) this.stats.hp = health;
        this.level = 0;
        this.xp = 0;
        this.xpNeeded = 10;
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