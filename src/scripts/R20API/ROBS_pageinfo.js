on("chat:message", function (msg) {
    class Grid {
        /** 
         * Converts the Roll20 Drawing system to a grid-based approach.
         * @consts
         * @param {Roll20 Page Object} page - the Roll20 Page to create a grid for.  
         */
        constructor(page) {
            this.alignFontSize = 28;
            this.pageId = page.get('id');
            this.grid = [];
            this.currentResult = {};
            this.info = {
                slice: 1,
                w: page.get('width'),
                h: page.get('height'),
                gridSnap: page.get('snapping_increment'),
                get gU() { return (70 * this.gridSnap) * this.slice }, // Size (pixels) of a single grid unit.  
                get d() { return this.w * this.h }, //dimensions
                get wP() { return this.w * (this.gU) }, //width (pixels)
                get hP() { return this.h * (this.gU) }, //height (pixels)
                get dP() { return this.wP * this.hP }, //dimensions (pixels)
                get gW() { return Math.floor(this.w / (this.gridSnap * this.slice)) }, //grid segments wide (factoring in girdSnap)
                get gH() { return Math.floor(this.h / (this.gridSnap * this.slice)) }, //grid segments high (factoring in girdSnap)

            }
            log(`GRID UNIT IS ` + this.info.gU + 'px');


            let compare = this.compareDimensions(this.info.gW, this.info.gH)

            for (let y = 0; y <= compare['0']; y += this.info.slice) {
                for (let x = 0; x <= compare['1']; x += this.info.slice) {
                    let gridUnit = {};
                    gridUnit['x'] = x;
                    gridUnit['y'] = y;

                    gridUnit['pos'] = {
                        tL: { top: y * this.info.gU, left: ((x * this.info.gU) + (this.info.wP * y)) - (this.info.wP * y) },
                        tR: { top: y * this.info.gU, left: ((x * this.info.gU) + (this.info.wP * y)) - (this.info.wP * y) + this.info.gU },
                        bL: { top: y * this.info.gU + this.info.gU, left: ((x * this.info.gU) + (this.info.wP * y)) - (this.info.wP * y) },
                        bR: { top: y * this.info.gU + this.info.gU, left: ((x * this.info.gU) + (this.info.wP * y)) - (this.info.wP * y) + this.info.gU },
                        c: { top: y * (this.info.gU) + this.info.gU / 2, left: ((x * this.info.gU) + (this.info.wP * y)) - (this.info.wP * y) + this.info.gU / 2 }
                    }
                    //log("PSUHED UNIT")
                    this.grid.push(gridUnit);


                }
            }



        }


        /** 
         * Returns the top and left pixels for a given point on the grid.
         * @param {int} x - The x coordinate of the desired point. 	
         * @param {int} y - The y coordinate of the desired point.  
         * @param {int} p - The position on the desired point.  1 = top left, 2 = top right, 3 = bottom left, 4 = bottom right, 5 = center.  
         */
        get(x, y, p) {
            log(`${x},${y},${p}`);
            let mode;
            let node;

            switch (p) {
                case 1:
                    mode = 'tL';
                    break;
                case 2:
                    mode = 'tR';
                    break;
                case 3:
                    mode = 'bL';
                    break;
                case 4:
                    mode = 'bR';
                    break;
                case 5:
                    mode = 'c';
                    break;
                case undefined:
                    mode = 'u';
            }

            for (let g of this.grid) {
                if (g.x == x && g.y == y) {
                    if (mode != 'u') {
                        node = g['pos'];
                        return node[mode];
                    }
                    else {
                        return g;
                    }
                }
            }

        }
        move(obj, x, y, p) {
            const regex = /(\d+)\.(\d*)/;
            let xStr = x.toString();
            let yStr = y.toString();

            xStr = regex.exec(xStr) != null ? regex.exec(xStr) : x;
            yStr = regex.exec(yStr) != null ? regex.exec(yStr) : y;

            let xInt = Array.isArray(xStr) ? xStr[1] : x
            let xFloat = Array.isArray(xStr) ? parseFloat('0.' + xStr[2]) : 0;

            let yInt = Array.isArray(yStr) ? yStr[1] : y
            let yFloat = Array.isArray(yStr) ? parseFloat('0.' + yStr[2]) : 0;


            var self = this;

            if (p == undefined) {
                p = 5;
            }
            let pos = this.get(xInt, yInt, p);

            obj.set({ left: pos.left + (this.info.gU * xFloat), top: pos.top + (this.info.gU * yFloat) });
        }

        pxToCoords(t, l) {
            let yUnitsA = t / this.info.gU;
            let xUnitsA = l / this.info.gU;
            return { x: xUnitsA.toFixed(2), y: yUnitsA.toFixed(2) };
        }

        /** Converts the given top and left to its closest point on the grid.
         *   
         */
        snap(graphic, to) {
            if (typeof to == 'undefined') {
                to = 'c';
            }
            else {
                switch (to) {
                    case 1:
                        to = 'tL';
                        break;
                    case 2:
                        to = 'tR';
                        break;
                    case 3:
                        to = 'bL';
                        break;
                    case 4:
                        to = 'bR';
                        break;
                    case 5:
                        to = 'c';
                        break;
                }
            }

            let t = graphic.get('top');
            let l = graphic.get('left');

            let coords = this.pxToCoords(t, l);
            //Get the object for the approximate unit.
            var aUnit = this.get(Math.floor(coords.x), Math.floor(coords.y));


            let exactUnit = this.info.gU * this.info.w;
            let exactName = '';
            sendPing(aUnit.pos['c'].left, aUnit.pos['c'].top, Campaign().get('playerpageid'), null, false);
            graphic.set({ top: aUnit.pos[to].top, left: aUnit.pos[to].left });

            return graphic;
        }

        align(objects, hpi) {
            log(this.alignFontSize);
            /**
             * NOTE: See textMapper.js for reasoning.  
             * If text isn't properly aligned, you may need to generate a new map.  
             */

            if (hpi == undefined) {
                hpi = 10;
            }

            let fontMap = { "0": 0.5, "1": 0.5, "2": 0.5, "3": 0.5, "4": 0.5, "5": 0.5, "6": 0.5, "7": 0.5, "8": 0.5, "9": 0.5, "b": 0.5, "c": 0.44384765625, "d": 0.5, "e": 0.44384765625, "f": 0.3330078125, "g": 0.5, "h": 0.5, "i": 0.27783203125, "j": 0.27783203125, "k": 0.5, "l": 0.27783203125, "m": 0.77783203125, "n": 0.5, "o": 0.5, "p": 0.5, "q": 0.5, "r": 0.3330078125, "s": 0.38916015625, "t": 0.27783203125, "u": 0.5, "v": 0.5, "w": 0.72216796875, "x": 0.5, "y": 0.5, "z": 0.44384765625, "A": 0.72216796875, "B": 0.6669921875, "C": 0.6669921875, "D": 0.72216796875, "E": 0.61083984375, "F": 0.55615234375, "G": 0.72216796875, "H": 0.72216796875, "I": 0.3330078125, "J": 0.38916015625, "K": 0.72216796875, "L": 0.61083984375, "M": 0.88916015625, "N": 0.72216796875, "O": 0.72216796875, "P": 0.55615234375, "Q": 0.72216796875, "R": 0.6669921875, "S": 0.55615234375, "T": 0.61083984375, "U": 0.72216796875, "V": 0.72216796875, "W": 0.94384765625, "X": 0.72216796875, "Y": 0.72216796875, "Z": 0.61083984375, "`": 0.3330078125, "[": 0.3330078125, "]": 0.3330078125, "\\": 0.27783203125, ",": 0.25, ".": 0.25, "/": 0.27783203125, "~": 0.541015625, "!": 0.3330078125, "@": 0.9208984375, "#": 0.5, "$": 0.5, "%": 0.8330078125, "^": 0.46923828125, "&": 0.77783203125, "*": 0.5, "(": 0.3330078125, ")": 0.3330078125, "_": 0.5, "+": 0.56396484375, "{": 0.47998046875, "}": 0.47998046875, "|": 0.2001953125, "": 0, "<": 0.56396484375, ">": 0.56396484375, "?": 0.44384765625, " ": 0.25, ":": 0.27783203125, ";": 0.27783203125, "a": 0.44384765625, "-": 0.3330078125 };
            var fS = this.alignFontSize; //Desired font size for text found. 

            for (let o of objects) {
                if (o.get('type') == 'text') {
                    let fWidth = 0;
                    for (let t of o.get('text')) {
                        log(t);
                        if (fontMap[t] == undefined) {
                            log(t + ' undefined!');
                        };
                        fWidth += fontMap[t] * fS;
                    }
                    o.set('font_family', "fsdfsdfsd");
                    o.set('font_size', fS);
                    log("FWIDTH IS " + fWidth);
                    o.set({ width: fWidth });

                }
            }
            //Snap the first object to its closest coordinate.  
            //objects[0] = this.snap(objects[0]);
            let firstLeft = objects[0].get('left');

            //Align each object first. 
            for (let o of objects) {
                o.set({ left: firstLeft });
            }




            let origins = [];

            objects.forEach(o => {
                let width = o.get('width');
                let left = o.get('left');
                let top = o.get('top');
                let origin = left - (width / 2);

                let unit = width / fS;

                origin = { x: origin, y: o.get('top') };
                log(origin);
                let retObj = {}
                retObj['object'] = o;
                retObj['origin'] = origin;
                origins.push(retObj);
            });

            let firstOrigin = origins[0].origin;
            let firstObj = origins[0].object;


            let noObjs = 0;
            for (let o of origins) {
                if (o.origin != firstOrigin) {
                    log("to align");
                    let firstO = firstOrigin.x;
                    let currentO = o.origin.x;
                    let currentL = o.object.get('left');
                    let firstL = firstObj.get('left');
                    let originDiffx = (firstOrigin.x - o.origin.x);
                    noObjs++;
                    let newLeft = firstL + originDiffx;
                    o.object.set({ top: firstOrigin.y + (hpi * noObjs), left: newLeft });
                }
                else {
                    log("is origin");

                }
            }

        }


        compareDimensions(a, b) {
            if (a > b) {
                return {
                    0: b,
                    1: a
                }
            }
            else {
                return {
                    0: a,
                    1: b,
                }
            }
        }


        cleanImgSrc(imgsrc) {
            var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
            if (parts) {
                return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`);
            }
            return;
        }
    }



    //This allows players to enter !sr <number> to roll a number of d6 dice with a target of 4.
    if (msg.type == "api" && msg.content.indexOf("!robspageinfo") !== -1) {
        //Commands should bei n the format {x:...,y:...}
        var string = msg.content.replace("!robspageinfo", "");

        var playerpageid = Campaign().get('playerpageid');
        let playerpage = getObj('page', playerpageid);

        var grid = new Grid(playerpageid);
        log(grid); 
       

        return; 
        

       // center everyone on the selected token


        //sendChat(msg.who, "/roll " + numdice + "d6>4");
    }
});