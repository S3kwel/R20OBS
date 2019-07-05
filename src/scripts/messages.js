$(async function () { 


    function log(message) {
        console.log(`%c ${message}`, `background: #222; color: #bada55`);
    }
    let firstMutation = true;



    let chatBox = $(`.content`);
    let config = { attributes: false, childList: true, subtree: false };

   
    var process = function (mutationList, observer) {


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
                r['avatar'] = $(IDINFO_MSG).find('.avatar').find('img').attr('src'); 
                r['messageid'] = $(IDINFO_MSG).data('messageid'); 
                r['timestamp'] = $(IDINFO_MSG).children('.tstamp').html(); 
                r['by'] = $(IDINFO_MSG).children('.by').html();
                r['by'] = r['by'].substring(0, r['by'].length - 1); 

                console.log(msg[0]); 

                //TEXT
                //Plain text has either 0 or 4 children.  
                if (children.length == 0 || children.length == 4) {
                    log("TEXT"); 
                    r['type'] = "text";
                    r['content'] = msg.clone().children().remove().end().text();  
                }

                //OTHERS
                //log("OTHER"); 
                if (children.length > 0 && children.length != 4) {
                    let childClass = [...msg[0].classList]; 
                    console.log(childClass); 

                    //ROLLS
                    if (childClass.indexOf('rollresult') != -1) {
                        log("ROLL COMMAND");
                        r['type'] = 'roll'; 
                        r['formula'] = $(msg).children('.formula').html();
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
                    if (msg.find('.sheet-rolltemplate-atk').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-atk');
                        let rollResult = element.find('.inlinerollresult').text(); 
                        log("ATTACK COMMAND");
                        let rollFormula = $(element.find('.inlinerollresult').attr('title')).text();
                            rollFormula = rollFormula.replace(/\w*cs>\w*/g, rollFormula.match(/\((\d*)/gm)[0]);
                            rollFormula = rollFormula.replace(/\(/g, "");
                            rollFormula = rollFormula.replace(/\d*$/g, "");
                            rollFormula += rollResult;

                        r['type'] = 'attack';
                        r['result'] = rollResult; 
                        r['formula'] = rollFormula; 

                        r['sublabel'] = $(element).find('.sheet-sublabel').text().trim();
                        r['label'] = $(element).find('.sheet-label').text().trim();
                       

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
                        log("DAMAGE"); 


                    }

                    //SPELL
                    //Not coherent enough to continue.  Sorry, future me.  

                    if (msg.find('.sheet-rolltemplate-spell').length != 0) {
                        let element = msg.find('.sheet-rolltemplate-spell');
                        log("SPELL");
                        r['type'] = 'spell'; 
                        r['spellname'] = element.find('.sheet-title').text().trim(); 
                    }
                   
                    
                    

                }

                //console.log(children); 
                console.log(r); 
                
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