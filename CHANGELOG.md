## v1.10.1
- Improved compatibility with Item Piles
  - Containers and Vaults should now be lockable
  - Containers locked by Item Piles will now be automatically unlocked when unlocked with Lock & Key
- Fixed small translation error

## v1.10.0
- Added Item setting Replacement items to set items that get consumed instead of this item when a roll fails
- Improved crit calculation for the Pf2e crit system

## v1.9.13
- Small bug fix

## v1.9.12
- Added additional IDs of lock pick items for Pf2e (thanks to [ottyn](https://github.com/Saibot393/LocknKey/issues/created_by/ottyn))
  - will only be added when using the system defaults ("") or resetting the settings
  - Updated IDs: zvLyCVD8g2PdHJAc;6nrCxNQFycUVFOV2;Ejmv9IHGp9Ad9dgu;QnuL1UEot8ptWNb1;spqcRLBsMOC9WTcd;fprUZviW8khm2BLo;AFE073UYI0mkWuUs

## v1.9.11
- The tab bar of token settings should be less likely to overflow when multiple modules add tabs

## v1.9.10
- Updated the Chinese translation (thanks to Thousand (_thousand@Discord))

## v1.9.9
- Improved arms reach integration

## v1.9.8
- Fixed bug with Pf2e roll integration
- Fixed critical result identification bug

## v1.9.7
- Wall settings will now appear in their own tab and the settings sheet will fit on your screen again

## v1.9.6
- Improved visual compatibility with modules like Tidy5e sheets (Thanks to [Ikabodo](https://github.com/Ikabodo))
- Added support for the [Perceptive](https://foundryvtt.com/packages/perceptive) module
  - A "Peek lock" option will be added to the lock interaction menu

## v1.9.5
- Fixed bug for v10 regarding left clicking doors

## v1.9.4
- Improved Item Piles integration
  - There is a small chance, that previously locked item piles will not unlock correctly, in this case:
    - Click configure at the top border of the character sheet of the item pile
    - Check the "Enabled" option
    - Update document
  - or select the token and execute this macro:
    - canvas.tokens.controlled[0].document.setFlag("item-piles", "data.enabled", true)
   
## v1.9.3
- Fixed libwrapper warning with Monks enhanced journals

## v1.9.2
- Some bug fixes for v10 and the Sandbox system

## v1.9.1
- Fixed bug in relation to lockpick items in the Sandbox module
- Added "no matching key" popup
- Lock interaction popup will now only show up if the interacting token is within interaction range
- Added option Show all lock interactions to show even unavailable options the interaction popup
  - Impossible interaction options (if for example a DC is set to -1) will no longer show up in the popup

## v1.9.0
- Added Control Keys for Lock interactions (for both GM and player controls)
- Added client setting Control sceme to either use the standard controls to interact with doors or to get a pop up when right-clicking a lock
- Added world setting Key creation menu to create a menu when creating a new key, allowing the GM to choose the name and folder of the new item
- Added world setting Key name as ID to use the keys name as an additional ID when interacting with locks
- Added world setting Mention lockpick item to give additional information in the chat regarding the used item when picking a lock
- Added lock setting Special lockpick to set a special lockpick required to pick this lock
- Fixed bug/improved compatibility for the Sandbox system

## v1.8.2
- Added support for the Sandbox system

## v1.8.1
- Updated Chinese translation (thanks to [feederze](https://github.com/feederze))
  
## v1.8.0
- Added Lock jamming
  - World settings:
    - Jam lock on critical lockpick fail to automatically set locks as jammed
    - Keys can't be used on jammed locks to prevent matching keys from being used on jammed locks
  - Lock settings:
    - Jammed to set this lock as jammed preventing it from being picked

## v1.7.1
- Small fix for Item-Piles compatibility

## v1.7.0
- Added Macros for player and GM actions
- Added Lock setting Custom Popups to set custom Popup messages for certain player actions
- Added Token Lock setting Lock Sound to set the sound set used for interactions with this lock

## v1.6.2
- Added Chinese translation (thanks to [feederze](https://github.com/feederze))
- Fixed a few translations bugs/typos (thanks to [cadowtin](https://github.com/cadowtin))

## v1.6.1
- Fixed a few UI bugs

## v1.6.0
- Improved Pf2e integration (thanks to [cadowtin](https://github.com/cadowtin))
  - New setting Use Pf2e roll system to use the Pf2e system instead of the Lock & Key roll and crit settings
  - Should be fully compatible with the Pf2e rules system
- Added Multi-success during combat only to disablerequired multi success outside of combat
- Added quantity check for Lockpicks (in most systems, some systems are weird)

## v1.5.0
- Added passwords for locks
- Removed "Not a lock" message to reduce unnecessary popups

## v1.4.1
- Several small bug fixes and improvements

## v1.4.0
- Improved behaviour when a player tries to interact with a object that is not a lock or a lock that is out of reach
- Added Critical rolls world setting
  - No crits to disable crits
  - Nat crits to crit on a nat 1 or nat 20
  - Nat crit & +-10 to crit on a not 1, nat 20 or 10 below or above the dc
- Added Lock pick successes required setting to locks
  - Before a lock can be locked/unlocked this many successes have to be accumulated
  - Crits will count as two successes
  - Also shows the GM how many successes have already been accumulated and allows GMs to change this number
- Added World setting Remove Lockpick on critical fail
- Added Key setting Remove on use to remove the key on use (or reduce the stack by one)
- Fixed some Token sheet UI bugs

## v1.3.0
- Added Lockable setting to doors (doors are still lockable by GM, independent of this setting)
- Improved Lockpicking
  - World setting Lockpick item now allows for multiple item names/IDs
  - Added on token/item Lockpick formula setting which will be added to Lockpick rolls
  - Added Lockpick formula override setting to tokens, which will override the worlds Lockpick formula instead of appending it
  - Added Lockpick formula override setting to items, which will override the worlds and the tokens Lockpick formula instead of appending it
- Added Lockbreacking
  - Player can attempt to break locks by alt+rightclicking them
  - Added World setting to break locks on lock break action (lock can only be locked by gm)
  - Added World setting Lockbreak roll formula
  - Added on token/item Lockbreak formula setting which will be added to Lockpick rolls
  - Added Lockbreak formula override setting to tokens, which will override the worlds Lockpick formula instead of appending it
  - Added Lockbreak formula override setting to items, which will override the worlds and the tokens Lockpick formula instead of appending it
- Lock settings will only show up in lockable tokens
- Fixed bug in Item sheets, that caused tab to reset upon data update
- Fixed bug that caused popups not to show up for doors

## v1.2.2
- Improved Arms reach integration
- Included item support for Cyberpunk Red (thanks to [diwako](https://github.com/diwako))

## v1.2.1
- Improved compatibility (other developers should now be able to easily interface with the module)
- Added chatmessage for lock pick success/fail
- fixed bug where item setting did not show up correctly in some cases
- fixed buug where under some cases locked tokens did not behave correctly
- several small bug fixes

## v1.2.0
- Compatibility with Rideable
- Generell improvements

## v1.1.0
- Added lockpicking
  - Locks now have a lockpick dc setting
  - New World setting: Lockpick item
  - New World setting: Lockpick formula
  - Player can try to shift+right-click a start an attempt at picking it (starts Lockpick formula)
  - Popups, sounds, chat messages for lockpicking
- Fixed small bug where changes in an ItemPile sheet were not synched correctly

A wrongly named file prevented some users from installing v1.0.0. This bug was "stealth" fixed in v1.0.0.

## v1.0.0
First release on Foundry
