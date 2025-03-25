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

        this.curItem = ""; //name of the item you are currently selecting
        this.curTag = "All"; //tag for sorting through items
        this.useTimer = 0; //for some items, so you cant spam them
        this.animationTimer = 0; //for hotbar animations
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

    hotbarItem(itemName, slot){ //move an item to the hotbar
        if(itemName == this.hotbar[slot]){
            this.hotbar[slot] = "";
        }
        else{
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

    renderHotBar() {
        if (this.useTimer > 0) this.useTimer--;
        if (this.animationTimer > 0) this.animationTimer -= 0.1;
        if (this.animationTimer < 0) this.animationTimer += 0.1;
    
        // Hotbar Inventory
        push();
        noFill();
        stroke(255);
        strokeWeight(50);
        arc(width, height, 595, 595, 180, 270);
    
        stroke("#604030");
        strokeWeight(45);
        arc(width, height, 595, 595, 180, 270);
    
        imageMode(CENTER);
    
        // Figure out which slots to show
        let slots = [
          this.selectedHotBar - 2,
          this.selectedHotBar - 1,
          this.selectedHotBar,
          this.selectedHotBar + 1,
          this.selectedHotBar + 2
        ];
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] < 0) slots[i] = 5 + slots[i];
          if (slots[i] > 4) slots[i] = slots[i] - 5;
        }
    
        // Render the items in each slot
        for (let i = 0; i < slots.length; i++) {
          let slotIndex = slots[i];
          let hotBarKey = this.hotbar[slotIndex];
          if (hotBarKey !== "") {
            // Compute position based on your original logic
            let x = width  - (cos(15 + 15*i + 15*this.animationTimer) * 300);
            let y = height - (sin(15 + 15*i + 15*this.animationTimer) * 300);
    
            // Draw the item image
            let item = this.items[hotBarKey];
            item.renderImage(x, y);
    
            // If there's more than one of this item, render the amount
            if (item.amount > 1) {
                console.log(item.amount, item)
              push();
              fill(255);
              stroke(0);
              strokeWeight(4);
              textAlign(RIGHT, BOTTOM);
              textSize(18);
              textFont(gameUIFont);
              // Adjust the offsets as needed to place the text nicely
              text(item.amount, x + 35, y +15);
              pop();
            }
          }
        }
    
        // Q & E key rectangles
        fill(150);
        stroke(255);
        strokeWeight(1);
        rectMode(CENTER);
        rect(width - (0.866 * 255), height - (0.5 * 255), 20, 20);  // Q
        rect(width - (0.5 * 255), height - (0.866 * 255), 20, 20);  // E
    
        // That triangular shape
        fill(255, 0, 0);
        beginShape();
        vertex(width - (0.676 * 250), height - (0.737 * 250));
        vertex(width - (0.737 * 250), height - (0.676 * 250));
        vertex(width - (0.707 * 265), height - (0.707 * 265));
        endShape(CLOSE);
    
        // Q/E text
        fill(0);
        stroke(0);
        textAlign(CENTER, CENTER);
        textSize(15);
        textFont(gameUIFont);
        text("Q", width - (0.866 * 255), height - (0.5 * 255) - 3);
        text("E", width - (0.5 * 255), height - (0.866 * 255) - 1.5);
    
        pop();
    }
    
}