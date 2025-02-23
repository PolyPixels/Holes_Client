class InvBlock{
    constructor(){
        this.items = {};
        this.hotbar = ["","","","",""]; //only put item names in here
        this.selectedHotBar = 0; //index of the selected hotbar item
        this.equiped = {
            head: "",
            neck: "",
            chest: "",
            legs: "",
            feet: ""
        };

        this.useTimer = 0; //for some items, so you cant spam them
    }

    addItem(item,amount){
        if(this.items[item] == undefined){
            this.items[item] = createItem(item);
            this.items[item].amount = amount;
        }else{
            this.items[item].amount += amount;
        }
    }

    equipItem(itemName){
        if(this.items[itemName].type == "Equipment"){
            if(this.equiped[this.items[itemName].slot] != "") this.unEquipItem(this.items[itemName].slot);
            this.equiped[this.items[itemName].slot] = itemName;
            curPlayer.statBlock.stats[this.items[itemName].statName] += this.items[itemName].statBoost;
            curPlayer.defense += this.items[itemName].defense;
        }
    }

    unEquipItem(slot){
        if(this.equiped[slot] != ""){
            curPlayer.statBlock.stats[this.items[this.equiped[slot]].statName] -= this.items[this.equiped[slot]].statBoost;
            curPlayer.defense += this.items[this.equiped[slot]].defense;
            this.equiped[slot] = "";
        }
    }

    hotbarItem(itemName,slot){ //move an item to the hotbar
        if(slot >= 0 && slot < this.hotbar.length){
            if (itemDic[itemName].type != "SimpleItem"){ //if item has a use
                this.hotbar[slot] = itemName;
            }
        }
    }

    dropItem(item,amount){
        //spawn a bag?
    }

    dropAll(){
        //spawn a bag?
    }

    renderHotBar(){
        if(this.useTimer > 0) this.useTimer--;

        // Hotbar Inventory
        push();
        noFill();
        stroke(255);
        strokeWeight(50);
        arc(width, height, 595, 595, 180, 270);

        stroke("#604030");
        strokeWeight(45);
        arc(width, height, 595, 595, 180, 270);

        fill(255);
        stroke(0);
        strokeWeight(2);
        if(this.selectedHotBar == 0) circle(width - (0.965 * 300), height - (0.258 * 300), 50);
        if(this.selectedHotBar == 1) circle(width - (0.866 * 300), height - (0.5 * 300), 50);
        if(this.selectedHotBar == 2) circle(width - (0.707 * 300), height - (0.707 * 300), 50);
        if(this.selectedHotBar == 3) circle(width - (0.5 * 300), height - (0.866 * 300), 50);
        if(this.selectedHotBar == 4) circle(width - (0.258 * 300), height - (0.965 * 300), 50);

        imageMode(CENTER);
        if(this.hotbar[0] != "") this.items[this.hotbar[0]].renderImage(width - (0.965 * 300), height - (0.258 * 300));
        if(this.hotbar[1] != "") this.items[this.hotbar[1]].renderImage(width - (0.866 * 300), height - (0.5 * 300));
        if(this.hotbar[2] != "") this.items[this.hotbar[2]].renderImage(width - (0.707 * 300), height - (0.707 * 300));
        if(this.hotbar[3] != "") this.items[this.hotbar[3]].renderImage(width - (0.5 * 300), height - (0.866 * 300));
        if(this.hotbar[4] != "") this.items[this.hotbar[4]].renderImage(width - (0.258 * 300), height - (0.965 * 300));
        
        fill(150);
        stroke(255);
        strokeWeight(1);
        rectMode(CENTER);

        //0.965, 0.258 circle stuff
        rect(width - (0.965 * 255), height - (0.258 * 255), 20, 20); //rect for "1" key
        //0.866, 0.5 circle stuff
        rect(width - (0.866 * 255), height - (0.5 * 255), 20, 20); //rect for "2" key
        //0.707, 0.707 circle stuff
        rect(width - (0.707 * 255), height - (0.707 * 255), 20, 20); //rect for "3" key
        //0.5, 0.866 circle stuff
        rect(width - (0.5 * 255), height - (0.866 * 255), 20, 20); //rect for "4" key
        //0.258, 0.965 circle stuff
        rect(width - (0.258 * 255), height - (0.965 * 255), 20, 20); //rect for "5" key

        fill(0);
        stroke(0);
        textAlign(CENTER, CENTER);
        textSize(15);
        text("1", width - (0.965 * 255), height - (0.258 * 255));
        text("2", width - (0.866 * 255), height - (0.5 * 255));
        text("3", width - (0.707 * 255), height - (0.707 * 255));
        text("4", width - (0.5 * 255), height - (0.866 * 255));
        text("5", width - (0.258 * 255), height - (0.965 * 255));

        pop();
    }
}