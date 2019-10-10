$(async function () { 

	function uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}


    /**
     * Distinctive logging to pick out extension messages from the console.  
     * @param {any} message The message to log.  
     */
    function log(message) {console.log(`%c ${message}`, `background: #222; color: #bada55`);}

	
	function cleanRolls(string, advantage){
			if(string.indexOf('.') != -1){
				
			}
	}

    /**
     * Takes the input string and returns its shorthand form for components (V,S,M)
     * Returns the original string if none were found.  
     * @param {any} string The input string.  
     */
	function cleanComps(string){
        let r = string.match(/[V]|[S]|[M]/gm); 
		//console.log("MATCH");
		//console.log(r); 
        let rS;  
		if(r.length != 0){
			rS = '';
			//console.log(r); 
			for(let i of r){
				rS += i + ','; 
				//console.log(i); 
			}
			//Strip the last comma.  
            rS = rS.substring(0, rS.length - 1);		
        }

        //...Check for components with a currency requirement.  
        let currencies = ['CP', 'SP', 'GP', 'PP', 'EP','cp','sp','pp','ep','gp']; 
        for (let currency of currencies) {
            if (string.indexOf(currency) != -1) {
                if (rS != '') {
                    rS += '*';
                    return rS;
                }
                else { return rS; }
            }
        }
		if(rS != ''){
			return rS; 
		} 
		return string; 
	}
    /**
     * Takes the message in progress and add crit/fail designations if needed.  
     * @param {any} crit the CSS tag used to denote a crit.
     * @param {any} fail the CSS tag used to denote a fail.
     * @param {any} msg the message element to be considered. 
     * @param {any} r the message in progress.  
     */
    function critHandle(crit,fail,msg,r) {
        if ($(msg).children().find(crit).length != 0) { r['crit'] = true; }
        if ($(msg).children().find(fail).length != 0) { r['fail'] = true; }
        return r; 
    }

    function actionHandle(string) {
        let ret; 
        switch (string) {
            case "1 action":
                ret = "1A";
                break;
            default:
                ret = string;
                break;
        }

        return ret; 
    }

    function durationParse(string) {
        let ret;
        string = string.toLowerCase(); 

        let digits = string.match(/\d{2}|\d{1}/gmi);
        if (digits != null) {
            digits = digits[0]; 
        }

        let hMatches = string.match(/[0-9]{2} hour |[0-9]{1} hour/gmi); 
        let mMatches = string.match(/[0-9]{2} minute |[0-9]{1} minute/gmi); 
        let rMatches = string.match(/[0-9]{2} round |[0-9]{1} round/gmi); 

        //For a specified number of hours...
        if (hMatches != null) {
            if (hMatches.length != 0) { ret = `${digits}H`; }
        }

        //...minutes...
        if (mMatches != null) {
            if (mMatches.length != 0) { ret = `${digits}M`; }
        }

        //...rounds...
        if (rMatches != null) {
            if (rMatches.length != 0) { ret = `${digits}R`; }
        }
        //Instantaneous... 
        if (string == 'instantaneous') { ret = "I"; }

        //Until dispelled...
        if (string.indexOf('until dispelled') != -1) { ret = 'UD'; }

        //Default...
        

        //Conentration requirement.... 
        if (string.indexOf('concentration') != -1) {
            ret += '*';
        }

        return ret; 
    }

	//mutationObserver settings.  
    let firstMutation = true;
    let chatBox = $(`.content`);
    let config = { attributes: false, childList: true, subtree: false };

   /**
    * Scrubs the mutations of chatBox for Roll20-formatted messages.  
    * @param {any} mutationList
    * @param {any} observer
    */
	var lastSend = ''; 
    var process = async function (mutationList, observer) {
        for (m of mutationList) {
            let message;

            //Allows template reading from the server's test page.  
			if(window.location.href.indexOf('test') != -1){message = m.addedNodes[1];}

            //Standard reading for production.
            else { message = m.addedNodes[0]; }

            if (m.type == 'childList' && firstMutation == false && typeof message != 'undefined') {
				//console.log(message); 
                var classArray = [...message.classList];

                if (classArray.indexOf('system') != -1 || classArray.indexOf('error') != -1) {
                    //console.log('Skipping system message...'); 
                    break;
                }

                //Object to send out to the sever. 
                let r = {}; 
				r.internalID = uuid();   

                let msg = $(message);
                let IDINFO_FOUND = false;
                let IDINFO_MSG = $(message); 
                let children = msg.children();


                //For every message, we will need to identify the closest one with identifying information.
                do {
                    let by = $(IDINFO_MSG).children('.by').html();
                    if (IDINFO_FOUND == false) {
                        if (typeof by != 'undefined') {
                            IDINFO_FOUND = true;
                        }
                        else {
                            IDINFO_MSG = $(IDINFO_MSG).prev('.message');
                        }
                    }
                }
                while (IDINFO_FOUND == false);
               
                //Populate the return with IDINFO data. 
                r['avatar'] = `http://app.roll20.net` + $(IDINFO_MSG).find('.avatar').find('img').attr('src'); 
                r['messageid'] = $(message).data('messageid'); 
                r['timestamp'] = $(IDINFO_MSG).children('.tstamp').html(); 
                r['by'] = $(IDINFO_MSG).children('.by').html();
                r['by'] = r['by'].substring(0, r['by'].length - 1); 

                //MESSAGE TYPES

                //TEXT
                //Plain text has either 0 or 4 children.  
                if (children.length == 0 || children.length == 4) {
                    log("TEXT");
                    r['type'] = "text";
                    r['content'] = msg.clone().children().remove().end().text();
                }
                //EMOTES
                else if (children.length == 2) {
                    log("EMOTE");
                    r['type'] = 'emote';
                    r['content'] = msg.clone().children().remove().end().text();
                }

                if (children.length > 0 && children.length !== 4) {
                    let childClass = [...msg[0].classList]; 
                   
                    //ROLLS
                    if (childClass.indexOf('rollresult') != -1) {
                        log("ROLL COMMAND");
                        r['type'] = 'roll'; 
                        r['formula'] = $(msg).children('.formula').html().toLowerCase().replace('rolling', '');
                        r['result'] = $(msg).children('.rolled').html(); 
						
						console.log($(msg).children('.rolled').html()); 
                        
						r = critHandle('.critsuccess', '.critfail', msg, r); 
                    }

                    //ATTACK COMMANDS
                    //At the moment, the advantage property only determines whether dis/advantage was considered.
                    //Theoretically we could check which of the sheet-adv is greyed out and see if it's the lower or higher.
                    //The only way to tell between attacks and spell attacks would be to cross-reference sheet-label with spell names.
                    //Maybe hit the compendium via AJAX to determine?  
                    //
                    if (msg.find('.sheet-rolltemplate-atk').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-atk');
                        let rollResult = element.find('.inlinerollresult').text(); 
						console.log(rollResult); 
                        log("ATTACK COMMAND");
                        let rollFormula = $(element.find('.inlinerollresult').attr('title')).text();
                            rollFormula = rollFormula.replace(/\w*cs>\w*/g, rollFormula.match(/\((\d*)/gm)[0]);
                            rollFormula = rollFormula.replace(/\(/g, "");
                            rollFormula = rollFormula.replace(/\d*$/g, "");
                            rollFormula += rollResult;
							rollFormula = rollFormula.replace("Rolling ","");  

                        r['type'] = 'attack';
                        r['result'] = rollResult; 
						
                        r['formula'] = rollFormula; 

                        r['sublabel'] = $(element).find('.sheet-sublabel').text().trim();
                        r['label'] = $(element).find('.sheet-label').text().trim();

                        //Hit the Compendium API to see if a spell result comes up. 
                        var testType = r['label'].replace(/\((.*?)\)/, '');

                        let spellCheck = await $.ajax({
                            type: "GET",
                            url: `https://app.roll20.net/compendium/compendium/globalsearch/dnd5e/?sharedCompendium=4538472&template=true&terms=${testType}`
                        });
                        
                        let spellData = JSON.parse(spellCheck);
					
                        //Currently limited to the first result returned.  
                        if (Object.keys(spellData.results).length != 0) {
                            let v = Object.values(spellData)[0][0];
                            if (v.a.indexOf('Spells') != -1) {
                                log("SPELL ATTACK");
                                r['type'] = "spellattack"; 
                                r['castingtime'] = actionHandle(v.c[3]);
                                r['duration'] = durationParse(v.c[7]);
                                r['range'] = v.c[4];
                                r['target'] = element.find('span[data-i18n="target:"]').next().text().trim();
                                r['components'] = cleanComps(v.c[5]);								
                            }
                        }
                

                        if (element.find('.sheet-solo').length != 0) {
                            log("NO ADVANTAGE"); 
                            r['advantage'] = false; 

                        }

                        else if (element.children().find('.sheet-adv').length != 0) {
                            log("ADVANTAGE");
                            r['advantage'] = true; 
                            
                        }
						
                        //CHECK FOR DESCRIPTION
                        //.sheet-desc
                        if (msg.find('.sheet-desc').length != 0) {
                            let element = msg.find('.sheet-desc');
                            r['description'] = element.text().trim(); 
                        }

            
                        r = critHandle('.fullcrit', '.fullfail', msg, r);
						r = cleanResults(r); 
                    }

                    //DAMAGE
                    if (msg.find('.sheet-damagetemplate').length != 0) {
                        let element = msg.find('.sheet-damagetemplate'); 

                        let rollResult = element.find('.inlinerollresult').text();
						console.log(rollResult); 
                        let rollFormula = $(element.find('.inlinerollresult').attr('title')).text();
                        rollFormula = rollFormula.replace(/\w*cs>\w*/g, rollFormula.match(/\((\d*)/gm)[0]);
                        rollFormula = rollFormula.replace(/\(/g, "");
                        rollFormula = rollFormula.replace(/\d*$/g, "");
                        rollFormula += rollResult;
						rollFormula = rollFormula.replace("Rolling ",""); 


                        log("DAMAGE"); 
                        r['type'] = 'damage'; 
                        r['result'] = rollResult;
                        r['formula'] = rollFormula; 
                        r['sublabel'] = $(element).find('.sheet-sublabel').text().trim();
                        r['label'] = $(element).find('.sheet-label').text().trim();

                        //Check for a save in the damage. 
                        if (element.parent().find('.sheet-atk.sheet-save').length != 0) {
                            log("SAVE REQUIRED");
                            r['save'] = element.parent().find('.sheet-atk.sheet-save').text().trim();
                        }
                    }

                    //SPELL
                    if (msg.find('.sheet-rolltemplate-spell').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-spell');
                        log("SPELL");
						r['type'] = 'spell'; 
						
                        if (element.find('span[data-i18n="casting-time:"]').next().text().trim() == "1 action") {
                            r['castingtime'] = "1A";
                        }
                        else {
                            r['castingtime'] = element.find('span[data-i18n="casting-time:"]').next().text().trim(); 
                        }
						
                        r['name'] = element.find('.sheet-title').text().trim(); 
                       
                        r['range'] = element.find('span[data-i18n="range:"]').next().text().trim(); 
                        r['target'] = element.find('span[data-i18n="target:"]').next().text().trim(); 
                        r['components'] = cleanComps(element.find('span[data-i18n="components:"]').next().text().trim());
                        r['duration'] = durationParse(element.find('span[data-i18n="duration:"]').next().text().trim()); 
                        r['description'] = element.find('.sheet-description').text().trim(); 
						
						
						
                    }

                    //TRAITS
                    if (msg.find('.sheet-rolltemplate-traits').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-traits');
                        log("TRAIT");
                        r['type'] = 'trait';
                        r['name'] = element.find('.sheet-header').text().trim();
                        r['components'] = element.find('.sheet-subheader').text().trim();
                        r['description'] = element.find('.sheet-desc').text().trim();
                    }

                    //SKILL
                    if (msg.find('.sheet-rolltemplate-simple').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-simple');
                        log("SKILL");

                        let rollResult = element.find('.inlinerollresult').html();
						console.log(rollResult); 
                        let rollFormula = $(element.find('.inlinerollresult').attr('title')).text();
                        rollFormula = rollFormula.replace(/\w*cs>\w*/g, rollFormula.match(/\((\d*)/gm)[0]);
                        rollFormula = rollFormula.replace(/\(/g, "");
                        rollFormula = rollFormula.replace(/\d*$/g, "");
                        rollFormula += rollResult;
                        rollFormula = rollFormula.replace("Rolling ", "");

                        r['type'] = 'skill';
                        r['result'] = rollResult;
                        r['formula'] = rollFormula; 
                        r['name'] = element.find('.sheet-label').text().trim();
                    }

                   
                    if (msg.find('.sheet-rolltemplate-npc').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-npc');
                        log("NPC ROLL");

                        let rollResult = element.find('.inlinerollresult').text();
						console.log(rollresult); 
                        let rollFormula = $(element.find('.inlinerollresult').attr('title')).text();
                        rollFormula = rollFormula.replace(/\w*cs>\w*/g, rollFormula.match(/\((\d*)/gm)[0]);
                        rollFormula = rollFormula.replace(/\(/g, "");
                        rollFormula = rollFormula.replace(/\d*$/g, "");
                        rollFormula += rollResult;
                        rollFormula = rollFormula.replace("Rolling ", "");

                        //r['type'] = 'skill';
                        r['result'] = rollResult;
                        r['formula'] = rollFormula;
                        r['name'] = element.find('.sheet-label').text().trim();

                        let rollType = element.parent().find(`.sheet-italics`).text().trim();
                        if (rollType.toLowerCase().indexOf('ability') != -1) {
                            log("NPC ABILITY CHECK"); 
                            r['type'] = 'skill';
                            r['name'] = element.parent().find(`.sheet-header`).text().trim();
                        }
                        //let rollType = element.parent().find(`.sheet-italics`).text().trim();
                    }
                    
                    if (msg.find('.sheet-rolltemplate-npcatk').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-npcatk');
                        log("NPC ATTACK");

                        let rollResult = element.find('.inlinerollresult').text();
						console.log(rollResult); 
                        let rollFormula = $(element.find('.inlinerollresult').attr('title')).text();
                        rollFormula = rollFormula.replace(/\w*cs>\w*/g, rollFormula.match(/\((\d*)/gm)[0]);
                        rollFormula = rollFormula.replace(/\(/g, "");
                        rollFormula = rollFormula.replace(/\d*$/g, "");
                        rollFormula += rollResult;
                        rollFormula = rollFormula.replace("Rolling ", "");

                        r['result'] = rollResult;
                        r['formula'] = rollFormula;
                        r['label'] = element.find('.sheet-row.sheet-header').find('a').text().trim();
                        r['type'] = 'attack';
                        r['description'] = element.find('.sheet-desc').text().trim(); 
                        r['by'] = element.find('.sheet-italics').text().trim().replace("Attack:",""); 

                        //let rollType = element.parent().find(`.sheet-italics`).text().trim();

                        //console.log(r);
                    }
                    
                    

                }

                //APPEND ORIGIN, SEND THE MESSAGE
                r['origin'] = "R20OBS"; 
                //console.log(r);
				if(lastSend != ''){
					if(lastSend.messageid == r.messageid){
						log("STOPPING DUPLICATE SEND");
					}
					else{
						if (typeof r.type != 'undefined') {
							chrome.runtime.sendMessage(r);
						}
					}
				}
				else{
					log('first message received! '); 
				}
				
                lastSend = r; 
                r = {};
                
            }
        }


        if (firstMutation == true) {
            //console.log("SETTING MUTATIONS TO FALSE");
            firstMutation = false;
        }
    }

    var messages = new MutationObserver(process);
    messages.observe(chatBox[0], config);
	
	
	
	
	
});