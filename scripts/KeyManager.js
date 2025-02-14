import { cModuleName, Translate, LnKutils, cLUuseKey, cLUusePasskey, cLUpickLock, cLUbreakLock } from "./utils/LnKutils.js";
import { Geometricutils } from "./utils/Geometricutils.js";
import { cLockTypeDoor, cLockTypeLootPf2e } from "./utils/LnKutils.js";
import { LnKFlags } from "./helpers/LnKFlags.js";
import { LnKPopups } from "./helpers/LnKPopups.js";
import { LnKSound } from "./helpers/LnKSound.js";
import { cCustomPopup } from "./helpers/LnKFlags.js";

const cLnKKeyIcon = "fa-key";
const cLnKPickLockIcon = "fa-solid fa-toolbox";
const cLnKBreakLockIcon = "fa-solid fa-hammer";
const cLnKCancelIcon = "fa-solid fa-xmark";

//does everything Key related (including lock picks, they are basically keys, right?)
class KeyManager {
	//DECLARATIONS
	static async onatemptedLockuse(pLockObject, pUseType) {} //called if a player tries to use a lock
	
	static async onatemptedKeyuse(pLockObject, pCharacter) {} //called if a player tries to usa a key on pLockObject 
	
	static async onatemptedcircumventLock(pLockObject, pUseType, pCharacter) {} //called if a player tries to circumvent pLockObject using pUsetype [cLUpickLock, cLUbreakLock]
	
	static onKeyContext(pHTML, pButtons) {} //adds buttons to item context
	
	static KeyItems(pInventory) {} //returns all Key items in pInventory
	
	static requestLockuse(puseData) {} //send a request to use Lock acording to pData
	
	//support
	static async cancircumventLock(pCharacter, pLock, puseMethod) {} //if pCharacter can circumvent pLock using puseMethod
	
	static async circumventLockroll(pCharacter, pLock, puseMethod, pRollData) {} //the (best) roll used to circumvent pLock using puseMethod
	
	static createPasskeyDialog(pLockObject, pLockType, pCharacter) {} //used to creat the passkey dialog
	
	static async createLockuseDialog(pLockObject) {} //used to create a popup with use options
	
	//IMPLEMENTATIONS
	static async onatemptedLockuse(pLockObject, pUseType) {
		let vCharacter = LnKutils.PrimaryCharacter();
		let vProblemPopup = "";
		
		if (vCharacter && pLockObject) {
			if (LnKFlags.LockDCtype(pLockObject, pUseType) == Infinity) {
				//Lock cant be picked/broken => possible popup message
				switch (pUseType) {
					case cLUpickLock:
						vProblemPopup = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LocknotPickable);
						break;
					case cLUbreakLock:
						vProblemPopup = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LocknotBreakable);
						break;
				}
			}
			
			if (vProblemPopup.length) {
				LnKPopups.TextPopUp(pLockObject, vProblemPopup); //MESSAGE POPUP
			}
			else {
				if (LnKFlags.isLockable(pLockObject)) {
					//check if pLockObject is even Lockable
					
					if (LnKutils.WithinLockingDistance(vCharacter, pLockObject)) {
						//check if lock is in reach
						switch (pUseType) {
							case cLUuseKey:
							case cLUusePasskey:
								KeyManager.onatemptedKeyuse(pLockObject, pUseType, vCharacter);
								break;
							case cLUpickLock:
							case cLUbreakLock:
								KeyManager.onatemptedcircumventLock(pLockObject, pUseType, vCharacter);
								break;
						}
					}
					else {
						LnKPopups.TextPopUpID(pLockObject, "Lockoutofreach", {pLockName : pLockObject.name}); //MESSAGE POPUP
					}
				}
			}
			/*
			else {
				LnKPopups.TextPopUpID(pLockObject, "NotaLock", {pLockName : pLockObject.name}); //MESSAGE POPUP
			}
			*/
		}
	}
	
	static async onatemptedKeyuse(pLockObject, pUseType, pCharacter) {	
		let vKeyItems;
		let vFittingKey;
		let vLockType = await LnKutils.Locktype(pLockObject);
		
		switch (pUseType) {
			case cLUuseKey:
				if (pLockObject && pCharacter) {
					//vKeyItems = await KeyManager.KeyItems(await LnKutils.TokenInventory(pCharacter, true));
					vKeyItems = await LnKutils.TokenInventory(pCharacter, true);
					
					//only key which contains keyid matching at least one key id of pLockObject fits
					vFittingKey = vKeyItems.find(vKey => LnKFlags.matchingIDKeys(vKey, pLockObject, game.settings.get(cModuleName, "UseKeynameasID")));				
					
					if (vFittingKey) {	
						let vData = {useType : cLUuseKey, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, KeyItemID : vFittingKey.id};
						KeyManager.requestLockuse(vData);
					}
					else {
						if (LnKFlags.HasPasskey(pLockObject)) {
							//no key item => use Passkey
							KeyManager.onatemptedKeyuse(pLockObject, cLUusePasskey, pCharacter);
						}
						else {
							LnKPopups.TextPopUpID(pLockObject, "nomatchingKey"); //MESSAGE POPUP
						}
					}
				}
				break;
			case cLUusePasskey:
				KeyManager.createPasskeyDialog(pLockObject, vLockType, pCharacter);
			break;
		}
	}
	
	static async onatemptedcircumventLock(pLockObject, pUseType, pCharacter) {
		let vRoll;
		let vRollData;
		let vRollFormula = "";
		let vLockType = await LnKutils.Locktype(pLockObject);
		let vUsedItemID;
		let vCircumvent;
		let vCallback;
			
		if (pCharacter) {
			//set roll data
			vRollData = {actor : pCharacter.actor};
			
			vCircumvent = await KeyManager.cancircumventLock(pCharacter, pLockObject, pUseType); //will save if circumvention possible and the item
			if (vCircumvent) {
				
				if (!game.settings.get(cModuleName, "usePf2eSystem")) {
					//get rollformula and used item (for roll formula)
					[vRollFormula, vUsedItemID] = await KeyManager.circumventLockroll(pCharacter, pLockObject, pUseType, vRollData);
					
					if (vUsedItemID.length <= 0 && vCircumvent.id) {
						//no special item was found but vCircumvent is item with id, so fall back to vCircumvent
						vUsedItemID = vCircumvent.id;
					}
					
					//roll dice according to formula
					vRoll =  new Roll(vRollFormula, vRollData);
					
					LnKSound.PlayDiceSound(pCharacter);
					
					Hooks.callAll(cModuleName+".DiceRoll", pUseType, pCharacter);
					
					await vRoll.evaluate();
					
					//ouput dice result in chat
					switch (pUseType) {
						case cLUpickLock:
							await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockPick", {pName : pCharacter.name}),rolls : [vRoll], type : 5}); //CHAT MESSAGE
							break;
						case cLUbreakLock:
							await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockBreak", {pName : pCharacter.name}),rolls : [vRoll], type : 5}); //CHAT MESSAGE
							break;
					}
					
					let vData = {useType : pUseType, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, UsedItemID : vUsedItemID, Rollresult : vRoll.total, Diceresult : vRoll.dice.map(vdice => vdice.total)};
					
					KeyManager.requestLockuse(vData);
				}
				else {
					//no roll neccessary, handled by Pf2e system
					vUsedItemID = vCircumvent.id;
					
					vCallback = async (proll) => {
						let vResult;
						
						switch (proll.outcome) {
							case 'criticalFailure':
								vResult = -1;
								break;
							case 'failure':
								vResult = 0;
								break;
							case 'success':
								vResult = 1;
								break;
							case 'criticalSuccess':
								vResult = 2;
								break;
							default:
								vResult = 0;
								break;
						}
						
						let vData = {useType : pUseType, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, UsedItemID : vUsedItemID, usePf2eRoll : true, Pf2eresult : vResult};
					
						KeyManager.requestLockuse(vData);
					};
		
					switch (pUseType) {
						case cLUpickLock:
							game.pf2e.actions.pickALock({
								actors: pCharacter.actor,
								callback: vCallback,
								difficultyClass: {value : LnKFlags.LockDCtype(pLockObject, pUseType)}
							});
							break;
						case cLUbreakLock:
							game.pf2e.actions.forceOpen({
								actors: pCharacter.actor,
								callback: vCallback,
								difficultyClass: {value : LnKFlags.LockDCtype(pLockObject, pUseType)}
							});
							break;
					}
				}			
			}
			else {
				if (pUseType == cLUpickLock) {
					LnKPopups.TextPopUpID(pLockObject, "noLockPickItem"); //MESSAGE POPUP
				}
			}
		}
	}
	
	static onKeyContext(pHTML, pButtons) {
		pButtons.push({
			name: Translate("Context.KeyCopy"),
			icon: `<i class="fas ${cLnKKeyIcon}"></i>`,
			condition: (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				//handle only key items
				return vItem.flags.hasOwnProperty(cModuleName);
			},
			callback: async (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				LnKFlags.copyIDKeys(vItem);
			}
		});
		
		pButtons.push({
			name: Translate("Context.KeyPaste"),
			icon: `<i class="fas ${cLnKKeyIcon}"></i>`,
			condition: (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				//handle only key items
				return vItem.flags.hasOwnProperty(cModuleName);
			},
			callback: async (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				LnKFlags.pasteIDKeys(vItem);
			}
		});
	} 
	
	static KeyItems(pInventory) {
		return pInventory.filter(vItem => vItem.flags.hasOwnProperty(cModuleName));
	}
	
	static requestLockuse(puseData) {
		if (game.user.isGM) {
			Hooks.call(cModuleName + ".LockuseRequest", puseData);
		}
		else {
			game.socket.emit("module."+cModuleName, {pFunction : "LockuseRequest", pData : puseData});
		}		
	}
	
	//support
	static async cancircumventLock(pCharacter, pLock, puseMethod) {
		switch (puseMethod) {
			case cLUpickLock:
				if (LnKFlags.hasSpecialLockpicks(pLock)) {
					return await LnKutils.hasLockPickItem(await LnKutils.TokenInventory(pCharacter, true), LnKFlags.GetSpecialLockpicks(pLock));
				}
				else {
					return await LnKutils.hasLockPickItem(await LnKutils.TokenInventory(pCharacter, true));
				}
				break;
			case cLUbreakLock:
				return true; //no item required
				break;			
			default:
				return false;
				break;
		}
	}
	
	static async circumventLockroll(pCharacter, pLock, puseMethod, pRollData) {
		let vValidItems;
		let vBestItem;
		let vBestItemID = "";
		let vRollFormula = "";
		
		//filter valid items for operation
		vValidItems = (await LnKutils.TokenInventory(pCharacter, true)).filter(vItem => LnKFlags.HasFormula(vItem, puseMethod));
		
		if (vValidItems.length) {
			//find best item		
			vBestItem = vValidItems[await LnKutils.HighestExpectedRollID(vValidItems.map(vItem => LnKFlags.Formula(vItem, puseMethod)), pRollData)];
			
			//create roll formula
			vRollFormula = LnKFlags.Formula(vBestItem, puseMethod);
		}
		
		if (!vBestItem || !LnKFlags.FormulaOverride(vBestItem, puseMethod)) {
			//no lock pick used or lock pick does not override
			vRollFormula = LnKutils.StitchFormula(LnKFlags.Formula(pCharacter, puseMethod), vRollFormula);
				
			if (!LnKFlags.FormulaOverride(pCharacter, puseMethod)) {
				vRollFormula = LnKutils.StitchFormula(LnKutils.formulaWorld(puseMethod), vRollFormula);
			}
		}
		
		if (!vRollFormula.length) {
			//if nothing has been set
			vRollFormula = "0";
		}
		
		if (vBestItem) {
			vBestItemID = vBestItem.id;
		}
		
		return [vRollFormula, vBestItemID];
	}
	
	static async createPasskeyDialog(pLockObject, pLockType, pCharacter) {
		let vTitle = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LockPasskeyTitle);
		
		if (!vTitle.length) {
			//revert to default if no custom
			vTitle = Translate("Titles.EnterPasskey");
		}
		
		new Dialog({
			title: Translate("Titles.Passkey"),
			content: `<label>${vTitle}</label>
					<input type="text" id="Passkey" name="Passkey">`,
			buttons: {
				button1: {
					label: Translate("Titles.ConfirmPasskey"),
					callback: (html) => {let vData = {useType : cLUusePasskey, SceneID : pLockObject.object.scene.id, Locktype : pLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, EnteredPasskey : html.find("input#Passkey").val()}; KeyManager.requestLockuse(vData)},
					icon: `<i class="fas ${cLnKKeyIcon}"></i>`
				}
			},
			default: Translate("Titles.ConfirmPasskey")
		}).render(true);
	}
	
	static async createLockuseDialog(pLockObject) {
		let vCharacter = LnKutils.PrimaryCharacter();
		let vLockType = await LnKutils.Locktype(pLockObject);
		
		let vshowKey;
		let vshowPicklock;
		let vshowBreaklock;
		
		let vButtons = {};
		
		if (LnKutils.WithinLockingDistance(vCharacter, pLockObject)) {
			vshowKey = LnKFlags.HasPasskey(pLockObject) || LnKFlags.HasKey(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
			vshowPicklock = LnKFlags.canbePicked(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
			vshowBreaklock = LnKFlags.canbeBroken(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
			
				
			if (vshowKey) {
				vButtons["UseKey"] = {
					label: Translate("Titles.UseKey"),
					callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUuseKey);},
					icon: `<i class="fas ${cLnKKeyIcon}"></i>`
				}
			}
			
			if (vshowPicklock) {
				vButtons["PickLock"] = {
					label: Translate("Titles.PickLock"),
					callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUpickLock);},
					icon: `<i class="fas ${cLnKPickLockIcon}"></i>`
				}
			}
			
			if (vshowBreaklock) {
				vButtons["BreakLock"] = {
					label: Translate("Titles.BreakLock"),
					callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUbreakLock);},
					icon: `<i class="fas ${cLnKBreakLockIcon}"></i>`
				}
			}
			
			await Hooks.callAll(cModuleName + ".DoorInteractionMenu", vButtons, pLockObject, vLockType, vCharacter, game.settings.get(cModuleName, "showallLockInteractions"));
				
			if (Object.keys(vButtons).length) {
				vButtons["Close"] = {
						label: Translate("Titles.Close"),
						callback: () => {},
						icon: `<i class="fas ${cLnKCancelIcon}"></i>`
				}
				
				let vDialog = new Dialog({
					title: Translate("Titles.Lockuse"),
					buttons: vButtons
				}).render(true);
					
				Hooks.once("renderDialog", (pDialog, pHTML, pdata) => {//Token Lock use
					if (pDialog.appID == vDialog.appID) {
						pHTML.find(`div.dialog-buttons`).css("flex-direction", "column"); //make buttons appear as list	
						pHTML.css("height", "max-content"); //resize window
					}
				}); 
			}
		}
		else {
			LnKPopups.TextPopUpID(pLockObject, "Lockoutofreach", {pLockName : pLockObject.name}); //MESSAGE POPUP
		}
	}
}

function onLockRightClick(pDocument, pInfos) {
	if (!game.user.isGM) {//CLIENT: use key
		if (!game.paused || !game.settings.get(cModuleName, "preventUseinPause")) {//use on pause check
			switch (game.settings.get(cModuleName, "ControlSceme")) {
				case "ControlSceme-rightKeys" :
					if (pInfos.shiftKey) {
						KeyManager.onatemptedLockuse(pDocument, cLUpickLock);
					}
					else {
						if (pInfos.altKey) {
							KeyManager.onatemptedLockuse(pDocument, cLUbreakLock);
						}
						else {
							KeyManager.onatemptedLockuse(pDocument, cLUuseKey);
						}
					}
					break;
				case "ControlSceme-rightPopups" :
				default:
					if (!pInfos.shiftKey && !pInfos.altKey && !pInfos.ctrlKey) {
						KeyManager.createLockuseDialog(pDocument);
					}
					break;
			}
		}
		else {
			LnKPopups.TextPopUpID(pDocument, "GamePaused"); //MESSAGE POPUP
		}
	}
}

//Hooks
Hooks.on(cModuleName + "." + "DoorRClick", (pDoorDocument, pInfos) => {//Door Lock use
	onLockRightClick(pDoorDocument, pInfos);
});

Hooks.on(cModuleName + "." + "TokenRClick", (pTokenDocument, pInfos) => {//Token Lock use
	onLockRightClick(pTokenDocument, pInfos);
}); 

Hooks.on('getItemDirectoryEntryContext', KeyManager.onKeyContext); //register Key context

//wrap export macro functions
function UseKeyonHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUuseKey); };

function PickHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUpickLock); };

function BreakHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUbreakLock); };

export { UseKeyonHoveredLock, PickHoveredLock, BreakHoveredLock }