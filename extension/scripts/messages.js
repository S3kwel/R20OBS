$(async function () { 


    function log(message) {
        console.log(`%c ${message}`, `background: #222; color: #bada55`);
    }
    let firstMutation = true;



    let chatBox = $(`.content`);
    let config = { attributes: false, childList: true, subtree: false };

   
    var process = async function (mutationList, observer) {


        for (m of mutationList) {
            let message = m.addedNodes[0];
            if (m.type == 'childList' && firstMutation == false && typeof message != 'undefined') {
                var classArray = [...message.classList];

                if (classArray.indexOf('system') != -1 || classArray.indexOf('error') != -1) {
                    console.log('Skipping system message...'); 
                    break;
                }

                //Object to send out to the sever. 
                let r = {}; 

                let msg = $(message);
                let IDINFO_FOUND = false;
                let IDINFO_MSG = $(message); 

                let children = msg.children();


                /**
                 * For every message, we will need to identify the closest one with identifying information.
                 * */
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
                r['messageid'] = $(IDINFO_MSG).data('messageid'); 
                r['timestamp'] = $(IDINFO_MSG).children('.tstamp').html(); 
                r['by'] = $(IDINFO_MSG).children('.by').html();
                r['by'] = r['by'].substring(0, r['by'].length - 1); 

                //console.log(msg[0]); 

                //TEXT
                //Plain text has either 0 or 4 children.  
                if (children.length == 0 || children.length == 4) {
                    log("TEXT");
                    r['type'] = "text";
                    r['content'] = msg.clone().children().remove().end().text();
                }
                else if (children.length == 2) {
                    log("EMOTE");
                    r['type'] = 'emote';
                    r['content'] = msg.clone().children().remove().end().text();
                }

                //OTHERS
                //log("OTHER"); 
                if (children.length > 0 && children.length != 4) {
                    let childClass = [...msg[0].classList]; 
                   
                    //ROLLS
                    if (childClass.indexOf('rollresult') != -1) {
                        log("ROLL COMMAND");
                        r['type'] = 'roll'; 
                        r['formula'] = $(msg).children('.formula').html().toLowerCase().replace('rolling', '');
                        r['result'] = $(msg).children('.rolled').html(); 

                        if ($(msg).children().find('.critsuccess').length != 0) {
                           r['crit'] = true;
                        }
                        if ($(msg).children().find('.critfail').length != 0) {
                            r['fail'] = true; 
                        }
                       
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
                        if (Object.keys(spellData).length != 0) {
                            let v = Object.values(spellData)[0][0];
                            if (v.a.indexOf('Spells') != -1) {
                                log("SPELL ATTACK");
                                console.log(v);

                                r['type'] = "spellattack"; 
                                r['castingtime'] = v.c[3];
                                r['duration'] = v.c[7];
                                r['range'] = v.c[4];
                                r['target'] = element.find('span[data-i18n="target:"]').next().text().trim();
                                r['components'] = v.c[5]; 
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

                        //if(msg.next())
                    }

                    //DAMAGE
                    if (msg.find('.sheet-damagetemplate').length != 0) {
                        let element = msg.find('.sheet-damagetemplate'); 

                        let rollResult = element.find('.inlinerollresult').text();
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
                        r['name'] = element.find('.sheet-title').text().trim(); 
                        r['castingtime'] = element.find('span[data-i18n="casting-time:"]').next().text().trim(); 
                        r['range'] = element.find('span[data-i18n="range:"]').next().text().trim(); 
                        r['target'] = element.find('span[data-i18n="target:"]').next().text().trim(); 
                        r['components'] = element.find('span[data-i18n="components:"]').next().text().trim();
                        r['duration'] = element.find('span[data-i18n="duration:"]').next().text().trim(); 
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

                        let rollResult = element.find('.inlinerollresult').text();
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

                        console.log(r);
                    }
                    
                    

                }

                //APPEND ORIGIN, SEND THE MESSAGE
                r['origin'] = "R20OBS"; 
                console.log(r);
                if (typeof r.type != 'undefined') {
                    chrome.runtime.sendMessage(r);
                }
                
                r = {};
                
            }
        }


        if (firstMutation == true) {
            console.log("SETTING MUTATIONS TO FALSE");
            firstMutation = false;
        }
    }
    var messages = new MutationObserver(process);
    messages.observe(chatBox[0], config);
});