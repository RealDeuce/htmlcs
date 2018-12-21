// Functions and stuff go here.

var i;
var changesOffset=0;
var applyClassLevels = [];
var statmap = {
	str:"Strength",
	dex:"Dexterity",
	con:"Constitution",
	wis:"Wisdom",
	int:"Intelligence",
	cha:"Charisma"
};

var skillstatmap = {
	acrobatics:'dex',
	animalhandling:'wis',
	arcana:'int',
	athletics:'str',
	deception:'cha',
	history:'int',
	insight:'wis',
	intimidation:'cha',
	investigation:'int',
	medicine:'wis',
	nature:'int',
	perception:'wis',
	performance:'cha',
	persuasion:'cha',
	religion:'int',
	sleightofhand:'dex',
	stealth:'dex',
	survival:'wis'
};

var roHandler = {
	setPrototypeOf:function() {
		throw new Error("Can't set the prototype");
	},
	isExtensible:function() {
		return false;
	},
	defineProperty:function() {
		throw new Error("Can't define properties");
	},
	set:function() {
		throw new Error("Can't set properties");
	},
	deleteProperty:function() {
		throw new Error("Can't delete properties");
	}
};

function modifier(x)
{
	if (modifier < 0) {
		return "-" + x.toString();
	}
	return "+" + x.toString();
}

function Item(i)
{
	this.type = 'mundaneitem';
	this.cost = i.cost === undefined ? 1 : i.cost;
	this.weight = i.weight === undefined ? 0 : i.weight;
	this.count = i.count === undefined ? 1 : i.count;
}

function Weapon(w)
{
	Item.call(this, w);
	this.type = 'weapon';
	this.name = w.name;
	this.ranged = w.ranged === undefined ? false : w.ranged;
	this.ammunition = w.ammunition === undefined ? false : w.ammunition;
	this.finesse = w.finesse === undefined ? false : w.finesse;
	this.heavy = w.heavy === undefined ? false : w.heavy;
	this.light = w.light === undefined ? false : w.light;
	this.loading = w.loading === undefined ? false : w.loading;
	this.range = w.range;
	this.reach = w.reach === undefined ? false : true;
	this.special = w.special;
	this.thrown = w.thrown === undefined ? false : w.thrown;
	this.twohanded = w.twohanded === undefined ? false : w.twohanded;
	this.versatile = w.versatile === undefined ? false : w.versatile;
	this.damage = w.damage === undefined ? [] : JSON.parse(JSON.stringify(w.damage));
	this.simple = w.simple === undefined ? true : w.simple;
	this.bonus = w.bonus;
}
Object.defineProperty(Weapon.prototype, 'melee', {
	enumerable:true,
	get() {
		return !this.ranged;
	}
});
Object.defineProperty(Weapon.prototype, 'martial', {
	enumerable:true,
	get() {
		return !this.simple;
	}
});
Weapon.prototype.getbonus = function(c, prof)
{
	var allowed = {};
	var mod = -10;
	var i;
	var proficient = false;
	var ret;

	if (c.ranged)
		allowed.Dexteritymod = true;
	else
		allowed.Strengthmod = true;
	if (c.finesse) {
		allowed.Dexteritymod = true;
		allowed.Strengthmod = true;
	}
	for (i in allowed) {
		if (allowed[i]) {
			if (c[i] > mod)
				mod = c[i];
		}
	}
	ret = mod + (this.bonus === undefined ? 0 : this.bonus);
	if (!prof)
		return ret;
	if (this.simple && c.weaponproficiencies.indexOf('Simple weapons') > -1)
		proficient = true;
	if (this.martial && c.weaponproficiencies.indexOf('Martial weapons') > -1)
		proficient = true;
	if (this.simple && c.weaponproficiencies.indexOf(this.name) > -1)
		proficient = true;
	if (proficient)
		return ret + c.proficiencybonus;
	return ret;
};

var weapons = [];
weapons.push(new Weapon({name:'Club',cost:10,damage:[{bludgeoning:'1d4'}],weight:2,light:true,simple:true}));
weapons.push(new Weapon({name:'Dagger',cost:200,damage:[{piercing:'1d4'}],weight:1,finesse:true,light:true,simple:true}));
weapons.push(new Weapon({name:'Greatclub',cost:20,damage:[{bludgeoning:'1d8'}],weight:10,twohanded:true,simple:true}));
weapons.push(new Weapon({name:'Handaxe',cost:500,damage:[{slashing:'1d6'}],weight:2,light:true,simple:true,thrown:true,range:'20/60'}));
weapons.push(new Weapon({name:'Javelin',cost:50,damage:[{piercing:'1d6'}],weight:2,simple:true,thrown:true,range:'30/120'}));
weapons.push(new Weapon({name:'Light hammer',cost:200,damage:[{bludgeoning:'1d4'}],weight:2,light:true,thrown:true,range:'20/60',simple:true}));
weapons.push(new Weapon({name:'Mace',cost:500,damage:[{bludgeoning:'1d6'}],weight:4,simple:true}));
weapons.push(new Weapon({name:'Quarterstaff',cost:20,damage:[{bludgeoning:'1d6'}],weight:4,versatile:'1d8',simple:true}));
weapons.push(new Weapon({name:'Sickle',cost:100,damage:[{slashing:'1d4'}],weight:2,light:true,simple:true}));
weapons.push(new Weapon({name:'Spear',cost:100,damage:[{piercing:'1d6'}],weight:3,thrown:true,range:'20/60',versatile:'1d8',simple:true}));

weapons.push(new Weapon({name:'Crossbow, light',cost:2500,damage:[{piercing:'1d8'}],weight:5,ranged:true,simple:true,ammunition:true,range:'80/320',loading:true,twohanded:true}));
weapons.push(new Weapon({name:'Dart',cost:5,damage:[{piercing:'1d4'}],weight:0.25,simple:true,ranged:true,finesse:true,thrown:true,range:'20/60'}));
weapons.push(new Weapon({name:'Shortbow',cost:2500,damage:[{piercing:'1d6'}],weight:2,simple:true,ranged:true,ammunition:true,range:'80/320',twohanded:true}));
weapons.push(new Weapon({name:'Sling',cost:10,damage:[{bludgeoning:'1d4'}],simple:true,ranged:true,ammunition:true,range:'30/120'}));

weapons.push(new Weapon({name:'Battleaxe',cost:1000,damage:[{slashing:'1d8'}],weight:4,simple:false,versatile:'1d10'}));
weapons.push(new Weapon({name:'Flail',cost:1000,damage:[{bludgeoning:'1d8'}],weight:2,simple:false}));
weapons.push(new Weapon({name:'Glaive',cost:2000,damage:[{slashing:'1d10'}],weight:6,simple:false,heavy:true,reach:true,twohanded:true}));
weapons.push(new Weapon({name:'Greataxe',cost:3000,damage:[{slashing:'1d12'}],weight:7,simple:false,heavy:true,twohanded:true}));
weapons.push(new Weapon({name:'Greatsword',cost:5000,damage:[{slashing:'2d6'}],weight:6,simple:false,heavy:true,twohanded:true}));
weapons.push(new Weapon({name:'Halberd',cost:2000,damage:[{slashing:'1d10'}],weight:6,simple:false,heavy:true,reach:true,twohanded:true}));
weapons.push(new Weapon({name:'Lance',cost:1000,damage:[{piercing:'1d12'}],weight:6,simple:false,reach:true,special:"You have disadvantage when you use a lance to attack a target within 5 feet of you. Also, a lance requires two hands to wield when you aren't mounted."}));
weapons.push(new Weapon({name:'Longsword',cost:1500,damage:[{slashing:'1d8'}],weight:3,simple:false,versatile:'1d10'}));
weapons.push(new Weapon({name:'Maul',cost:1000,damage:[{bludgeoning:'2d6'}],weight:10,simple:false,heavy:true,twohanded:true}));
weapons.push(new Weapon({name:'Morningstar',cost:1500,damage:[{piercing:'1d8'}],weight:4,simple:false}));
weapons.push(new Weapon({name:'Pike',cost:500,damage:[{piercing:'1d10'}],weight:18,simple:false,heavy:true,reach:true,twohanded:true}));
weapons.push(new Weapon({name:'Rapier',cost:2500,damage:[{piercing:'1d8'}],weight:2,simple:false,finesse:true}));
weapons.push(new Weapon({name:'Scimitar',cost:2500,damage:[{slashing:'1d6'}],weight:3,simple:false,finesse:true,light:true}));
weapons.push(new Weapon({name:'Shortsword',cost:1000,damage:[{piercing:'1d6'}],weight:2,simple:false,finesse:true,light:true}));
weapons.push(new Weapon({name:'Trident',cost:500,damage:[{piercing:'1d6'}],weight:4,simple:false,thrown:true,range:'20/60',versatile:'1d8'}));
weapons.push(new Weapon({name:'War pick',cost:500,damage:[{piercing:'1d8'}],weight:2,simple:false}));
weapons.push(new Weapon({name:'Warhammer',cost:1500,damage:[{bludgeoning:'1d8'}],weight:2,simple:false,versatile:'1d10'}));
weapons.push(new Weapon({name:'Whip',cost:200,damage:[{slashing:'1d4'}],weight:3,simple:false,finesse:true,reach:true}));

weapons.push(new Weapon({name:'Blowgun',cost:1000,damage:[{piercing:'1'}],weight:1,simple:false,ranged:true,ammunition:true,range:'25/100',loading:true}));
weapons.push(new Weapon({name:'Crossbow, hand',cost:7500,damage:[{piercing:'1d6'}],weight:3,simple:false,ranged:true,ammunition:true,range:'30/120',light:true,loading:true}));
weapons.push(new Weapon({name:'Crossbow, heavy',cost:5000,damage:[{piercing:'1d10'}],weight:18,simple:false,ranged:true,ammunition:true,range:'100/400',heavy:true,loading:true,twohanded:true}));
weapons.push(new Weapon({name:'Longbow',cost:5000,damage:[{piercing:'1d8'}],weight:2,simple:false,ranged:true,ammunition:true,range:'150/600',heavy:true,twohanded:true}));
weapons.push(new Weapon({name:'Net',cost:100,weight:3,simple:false,ranged:true,thrown:true,range:'5/15',special:'A Large or smaller creature hit by a net is Restrained until it is freed. A net has no effect on creatures that are formless, or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, ending the effect and destroying the net.\nWhen you use an action, bonus action, or reaction to attack with a net, you can make only one attack regardless of the number of attacks you can normally make.'}));

function Character()
{
	var sbase = localStorage.getItem('cs_base');
	var schange = localStorage.getItem('cs_change');
	/* These values are not subject to modifiers */
	if (sbase !== null) {
		this.base = JSON.parse(sbase);
		// TODO: Verify all properties are present, update as needed.
		// Ensure base is an object, etc.
	}
	else {
		this.base = {
			name:"",
			background:"Acolyte",
			playername:"",
			race:"Half-elf",
			alignment:"",
			xp:0,
			stat:{
				str:12,
				dex:10,
				con:10,
				wis:10,
				int:10,
				cha:10,
			},
			inspiration:false,
			currenthp:0,
			temphp:0,
			remaininghd:{},
			deathsaves:0,
			deathfailures:0,
			cp:0,
			sp:0,
			ep:0,
			gp:0,
			pp:0,
			personality:[],
			ideals:[],
			bonds:[],
			flaws:[],
			equipment:[],
			changes:[],
			classes:[]
		};
	}
	/* This is where modifiers are applied */
	this.calculated = {};
}

Character.prototype.recalc = function()
{
	var i;
	var calc;

	function setSaveProf(name, value) {
		if (calc.saveproficiencies[name] < value)
			calc.saveproficiencies[name] = value;

		return true;
	}

	function setSkillProf(name, value) {
		if (calc.skillproficiencies[name] < value)
			calc.skillproficiencies[name] = value;

		return true;
	}

	function addHitDie(type) {
		if (calc.totalhd[type] === undefined)
			calc.totalhd[type] = 1;
		else
			calc.totalhd[type]++;

		return true;
	}

	function addProficiency(type, name) {
		var p;
		if (type === 'weapon')
			p = 'weaponproficiencies'
		else if (type === 'armor')
			p = 'armorproficiencies'
		else if (type === 'other')
			p = 'otherproficiencies'
		else {
			throw new Error('Invalid proficiency type');
		}
		if (calc[p].indexOf(name) == -1)
			calc[p].push(name);

		return true;
	}

	function addWeapon(name, count) {
		if (count === undefined)
			count = 1;
		var cur = calc.equipment.find(item => {return item.name === name});

		if (cur === undefined) {
			var weap = new Weapon(weapons.find(w => {return w.name === name}));
			weap.count = count;
			calc.equipment.push(weap);
		}
		else
			cur.count += count;

		return true;
	}

	function choose(num, title, prompt, options)
	{
		var e = document.getElementById("modal-header");
		var ih;
		var i;
		var cancel = false;

		if (document.getElementById('choose') !== null) {
			if (document.getElementById('modal').style.display === 'none') {
				var opts = verifyChoose(true);
				if (opts === false)
					return false;
				for (i=0; i<opts.length; i++) {
					c.base.changes[parseInt(changesOffset, 10)+i] = options[opts[i]].eval;
					eval(options[opts[i]].eval);
				}
				document.getElementById('modal-body').innerHTML = '';

				return true;
			}
			return false;
		}
		else {
			e.innerHTML = title;
			e = document.getElementById("modal-close");
			if (cancel === undefined || cancel === false)
				e.style.display="none";
			else
				e.style.display="inline";
			e = document.getElementById("modal-body");
			ih = '<form id="simpleinputform" onsubmit="if(verifyChoose(false)===false) return false;modalclose();window.setTimeout(function(){updatepage();},0);" action="#"><p>'+prompt + '<br>';
			for (i in options) {
				ih += '<input type="checkbox" id="choose-'+i+'"> <label for="choose-'+i+'">'+options[i].name+'</label><br>';
			}
			ih += '<input type="hidden" value="'+num+'" id="choose"><input type="hidden" value="'+options.length+'" id="choices"></p><div class="modal-button"><button onclick="if(verifyChoose(false)===false) return false;modalclose();window.setTimeout(function(){updatepage();},0);">Ok</button></div></form>';
			e.innerHTML=ih;
			e = document.getElementById('modal');
			e.style.display="block";
			document.getElementById('choose-0').focus();

			return false;
		}
	}

	this.calculated = JSON.parse(JSON.stringify(this.base));
	calc = this.calculated;
	for (i in calc.equipment) {
		if (calc.equipment[i].type === 'weapon') {
			calc.equipment[i] = new Weapon(calc.equipment[i]);
		}
		else if (calc.equipment[i].type === 'mundaneitem') {
			calc.equipment[i] = new Item(calc.equipment[i]);
		}
	}
	calc.proficiencybonus = 2;
	calc.saveproficiencies = {
		str:0,
		dex:0,
		con:0,
		wis:0,
		int:0,
		cha:0
	};
	calc.skillproficiencies = {
		acrobatics:0,
		animalhandling:0,
		arcana:0,
		athletics:0,
		deception:0,
		history:0,
		insight:0,
		intimidation:0,
		investigation:0,
		medicine:0,
		nature:0,
		perception:0,
		performance:0,
		persuasion:0,
		religion:0,
		sleightofhand:0,
		stealth:0,
		survival:0
	};
	calc.weaponproficiencies=[];
	calc.armorproficiencies=[];
	calc.otherproficiencies=[];
	calc.languages=[];
	calc.ac=10;
	calc.initiative=this.Dexteritymod;
	calc.speed=0;
	calc.otherspeed=[];
	calc.maxhp=0;
	calc.trackers = [];
	calc.attacks = [];
	calc.features = [];
	calc.totalhd = {};
	this.languages = new Proxy(calc.languages, roHandler);
	this.weaponproficiencies = new Proxy(calc.weaponproficiencies, roHandler);
	this.armorproficiencies = new Proxy(calc.armorproficiencies, roHandler);
	this.otherproficiencies = new Proxy(calc.otherproficiencies, roHandler);
	for (changesOffset in this.base.changes) {
		if (!eval(this.base.changes[changesOffset])) {
			changesOffset = -1;
			break;
		}
	}
	// Testing...
	calc.languages.push('Common');
	calc.speed = 30;
	calc.remaininghd['d10']=1;
	calc.remaininghd['d8']=1;
	if (this.base.remaininghd.length <= 0) {
		this.base.remaininghd['d10']=1;
		this.base.remaininghd['d8']=1;
	}
	calc.deathsaves = 2;
	calc.deathfailures = 1;
};

var simpleprops = [
	'name',
	'background',
	'playername',
	'race',
	'alignment',
	'xp',
	'inspiration',
	'proficiencybonus',
	'ac',
	'initiative',
	'speed',
	'maxhp',
	'currenthp',
	'temphp',
	'deathsaves',
	'deathfailures',
	'cp',
	'sp',
	'ep',
	'gp',
	'pp'
];
for (i in simpleprops) {
	eval(
'	Object.defineProperty(Character.prototype, "'+simpleprops[i]+'", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return this.calculated["'+simpleprops[i]+'"];\n' +
'		}\n' +
'	});\n');
}

Object.defineProperty(Character.prototype, 'class', {
	enumerable:true,
	get() {
		var ret = '';
		var i;
		for (i in this.calculated.classes) {
			if (ret.length > 0)
				ret += ', ';
			ret += this.calculated.classes[i].name;
		}
		return ret;
	}
});

Object.defineProperty(Character.prototype, 'level', {
	enumerable:true,
	get() {
		var ret = '';
		var i;
		for (i in this.calculated.classes) {
			if (ret.length > 0)
				ret += ', ';
			ret += this.calculated.classes[i].level;
		}
		return ret;
	}
});

Object.defineProperty(Character.prototype, 'classlevel', {
	enumerable:true,
	get() {
		var ret = '';
		var i;

		for (i in this.calculated.classes) {
			if (ret.length > 0)
				ret += ', ';
			ret += this.calculated.classes[i].name + ' ' + this.calculated.classes[i].level;
		}
		return ret;
	}
});

for (i in statmap) {
	eval(
'	Object.defineProperty(Character.prototype, statmap["' + i + '"]+"score", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return this.calculated.stat["' + i + '"];\n' +
'		}\n' +
'	});\n' +
'	Object.defineProperty(Character.prototype, statmap["' + i + '"]+"mod", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return Math.floor((this.calculated.stat["' + i + '"] - 10)/2);\n' +
'		}\n' +
'	});\n' +
'	Object.defineProperty(Character.prototype, statmap["' + i + '"]+"-save-prof", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return this.calculated.saveproficiencies["' + i + '"];\n' +
'		}\n' +
'	});\n' +
'	Object.defineProperty(Character.prototype, statmap["' + i + '"]+"-save", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return this[statmap["' + i + '"] + "mod"] + Math.floor(this[statmap["' + i + '"]+"-save-prof"] * this.proficiencybonus);\n' +
'		}\n' +
'	});\n');
}

for (i in skillstatmap) {
	eval(
'	Object.defineProperty(Character.prototype, "' + i + '-prof", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return this.calculated.skillproficiencies["' + i + '"];\n' +
'		}\n' +
'	});\n' +
'	Object.defineProperty(Character.prototype, "' + i + '", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return this[statmap[skillstatmap["' + i + '"]] + "mod"] + Math.floor(this["' + i + '-prof"] * this.proficiencybonus);\n' +
'		}\n' +
'	});\n' +
'	Object.defineProperty(Character.prototype, "passive' + i + '", {\n' +
'		enumerable:true,\n' +
'		get() {\n' +
'			return 10 + this["' + i + '"] + Math.floor(this["' + i + '"+"-prof"] * this.proficiencybonus);\n' +
'		}\n' +
'	});');
}

Object.defineProperty(Character.prototype, 'totalhd', {
	enumerable:true,
	get() {
		var ret = '';
		var i;

		for (i in this.calculated.totalhd) {
			if (ret.length > 0)
				ret += ',';
			ret += this.calculated.totalhd[i] + i;
		}
		return ret;
	}
});

Object.defineProperty(Character.prototype, 'remaininghd', {
	enumerable:true,
	get() {
		var ret = '';
		var i;

		for (i in this.calculated.remaininghd) {
			if (ret.length > 0)
				ret += ',';
			ret += this.calculated.remaininghd[i] + i;
		}
		return ret;
	}
});

function updatepage()
{
	var i;
	var j;
	var k;
	var tmpstr;

	c.recalc();
	document.getElementById("name").value=c.name;
	document.getElementById("classlevel").value=c.classlevel;
	document.getElementById("background").value=c.background;
	document.getElementById("playername").value=c.playername;
	document.getElementById("race").value=c.race;
	document.getElementById("alignment").value=c.alignment;
	document.getElementById("xp").value=c.xp;
	document.getElementById("inspiration").value=c.inspiration;
	document.getElementById("proficiencybonus").value=modifier(c.proficiencybonus);

	for(i in statmap) {
		document.getElementById(statmap[i] + 'score').value=c[statmap[i] + 'score'];
		document.getElementById(statmap[i] + 'mod').value=modifier(c[statmap[i] + 'mod']);
		document.getElementById(statmap[i] + '-save-prof').checked = c[statmap[i] + '-save-prof'] > 0;
		document.getElementById(statmap[i] + '-save').value=modifier(c[statmap[i] + '-save']);
	}

	for (i in skillstatmap) {
		document.getElementById(i + '-prof').checked = c[i+'-prof'] > 0;
		document.getElementById(i).value=modifier(c[i]);
	}

	document.getElementById('passiveperception').value = c.passiveperception;

	document.getElementById('otherproficiencies').value = 'Languages:\n';
	for(i in c.languages) {
		document.getElementById('otherproficiencies').value += String.fromCharCode(8226) + ' ' + c.languages[i] + '\n';
	}
	document.getElementById('otherproficiencies').value += 'Weapon Proficiencies:\n';
	for(i in c.weaponproficiencies) {
		document.getElementById('otherproficiencies').value += String.fromCharCode(8226) + ' ' + c.weaponproficiencies[i] + '\n';
	}
	document.getElementById('otherproficiencies').value += 'Armor Proficiencies:\n';
	for(i in c.armorproficiencies) {
		document.getElementById('otherproficiencies').value += String.fromCharCode(8226) + ' ' + c.armorproficiencies[i] + '\n';
	}
	document.getElementById('otherproficiencies').value += 'Other Proficiencies:\n';
	for(i in c.otherproficiencies) {
		document.getElementById('otherproficiencies').value += String.fromCharCode(8226) + ' ' + c.otherproficiencies[i] + '\n';
	}

	document.getElementById('ac').value = c.ac;
	document.getElementById('initiative').value = c.initiative;
	document.getElementById('speed').value = c.speed;
	document.getElementById('maxhp').value = c.maxhp;
	document.getElementById('currenthp').value = c.currenthp;
	document.getElementById('temphp').value = c.temphp;
	document.getElementById('totalhd').value = c.totalhd;
	document.getElementById('remaininghd').value = c.remaininghd;
	document.getElementById('deathsuccess1').checked = c.deathsaves > 0;
	document.getElementById('deathsuccess2').checked = c.deathsaves > 1;
	document.getElementById('deathsuccess3').checked = c.deathsaves > 2;
	document.getElementById('deathfail1').checked = c.deathfailures > 0;
	document.getElementById('deathfail2').checked = c.deathfailures > 1;
	document.getElementById('deathfail3').checked = c.deathfailures > 2;
	tmpstr = '';
	// TODO: This uses calculated.
	for(i in c.calculated.equipment) {
		if (c.calculated.equipment[i].type == 'weapon') {
			tmpstr += '<tr><td>'+c.calculated.equipment[i].name + '</td>';
			tmpstr += '<td>'+modifier(c.calculated.equipment[i].getbonus(c,true))+'</td>';
			tmpstr += '<td>';
			for(j in c.calculated.equipment[i].damage) {
				if (j != 0)
					tmpstr += ' + ';
				for (k in c.calculated.equipment[i].damage[j])
					tmpstr += c.calculated.equipment[i].damage[j][k] + ' ' + k;
			}
			tmpstr += '</td>';
		}
	}
	document.getElementById('attackbody').innerHTML = tmpstr;
	document.getElementById('cp').value = c.cp;
	document.getElementById('sp').value = c.sp;
	document.getElementById('ep').value = c.ep;
	document.getElementById('gp').value = c.gp;
	document.getElementById('pp').value = c.pp;
	tmpstr = '';
	// TODO: This uses calculated.
	for(i in c.calculated.equipment) {
		if (c.calculated.equipment[i].count > 0) {
			tmpstr += c.calculated.equipment[i].count + ' ' + c.calculated.equipment[i].name + "\n";
		}
	}
	document.getElementById('equipment').value = tmpstr;
	verifybase();
}

function verifybase()
{
	var i;

	var e = document.getElementById('modal');
	if (c.name === '') {
		simpleinput("Name", "Character Name", "c.base.name = document.getElementById('modalinput').value;modalclose();window.setTimeout(function(){updatepage();},0);");
		e.style.display="block";
	}
	else if(c.playername === '') {
		simpleinput("Your Name", "Player Name", "c.base.playername = document.getElementById('modalinput').value;modalclose();window.setTimeout(function(){updatepage();},0);");
		e.style.display="block";
	}
	else if(c.alignment === '') {
		dropdown("Alignment", c.name+"'s Alignment", ["Lawful good", "Neutral good", "Chaotic good", "Lawful neutral", "Neutral", "Chaotic neutral", "Lawful evil", "Neutral evil", "Chaotic evil"], "c.base.alignment = document.getElementById('modalinput').value;modalclose();window.setTimeout(function(){updatepage();},0);");
		e.style.display="block";
	}
	else if(c.calculated.classes !== undefined && c.calculated.classes.length === 0) {
		dropdown("Class", c.name+"'s Class", Object.keys(classes).sort(),"addClassLevel(document.getElementById('modalinput').value);modalclose();window.setTimeout(function(){updatepage();},0);");
	}
	else if(changesOffset === -1) {
		// Waiting for choices.
	}
	else {
		applyClassLevels.forEach(cl=>{applyClassLevel(cl)});
		localStorage.setItem('cs_base', JSON.stringify(c.base));
	}
}

function modalclose()
{
	document.getElementById('modal').style.display="none";
}

function simpleinput(title, prompt, action, cancel)
{
	var e = document.getElementById("modal-header");

	e.innerHTML = title;
	e = document.getElementById("modal-close");
	if (cancel === undefined || cancel === false)
		e.style.display="none";
	else
		e.style.display="inline";
	e = document.getElementById("modal-body");
	e.innerHTML='<form id="simpleinputform" onsubmit="' + action + ';return false;" action="#"><p>'+prompt + ' <input id="modalinput" type="text" name="simpleinput"></p><div class="modal-button"><button onclick="' + action + '">Ok</button></div></form>';
	e = document.getElementById('modal');
	e.style.display="block";
	document.getElementById('modalinput').focus();
}

function dropdown(title, prompt, options, action, cancel)
{
	var e = document.getElementById("modal-header");
	var ih;
	var i;

	e.innerHTML = title;
	e = document.getElementById("modal-close");
	if (cancel === undefined || cancel === false)
		e.style.display="none";
	else
		e.style.display="inline";
	e = document.getElementById("modal-body");
	ih = '<form id="simpleinputform" onsubmit="' + action + ';return false;" action="#"><p>'+prompt + ' <select id="modalinput">';
	for (i in options) {
		ih += '<option value="'+options[i]+'">'+options[i]+'</option>';
	}
	ih += '</select></p><div class="modal-button"><button onclick="' + action + '">Ok</button></div></form>';
	e.innerHTML=ih;
	e = document.getElementById('modal');
	e.style.display="block";
	document.getElementById('modalinput').focus();
}


var c = new Character();
updatepage(c);

var classes = {
	'Barbarian':{
		level:{
			"1":{
				changes:[
					'calc.maxhp += 12; true',
					'calc.maxhp += c.Constitutionmod; true',
					'addHitDie("d12")',
					'addProficiency("weapon", "Simple weapons")',
					'addProficiency("weapon", "Martial weapons")',
					'addProficiency("armor", "Light armor")',
					'addProficiency("armor", "Medium armor")',
					'addProficiency("armor", "Shields")',
					'setSaveProf("str", 1)',
					'setSaveProf("con", 1)',
					'choose(2, "Skills", "Choose two skills", [{name:\'Animal Handling\',eval:\'setSkillProf(\"animalhandling\", 1)\'},{name:\'Athletics\',eval:\'setSkillProf(\"athletics\", 1)\'},{name:\'Intimidation\',eval:\'setSkillProf(\"intimidation\", 1)\'},{name:\'Nature\',eval:\'setSkillProf(\"nature\", 1)\'},{name:\'Perception\',eval:\'setSkillProf(\"perception\", 1)\'},{name:\'Survival\',eval:\'setSkillProf(\"survival\", 1)\'}])',
					'choose(2)',
					'choose(1, "Melee Weapon", "Choose a greataxe or any martial melee weapon.", weapons.filter(function (entry) { return entry.melee && entry.martial }).map(function(element) {return {name:element.name,eval:"addWeapon(\'"+element.name+"\')"}}))',
					'choose(1, "Simple Weapon", "Choose two handaxes or any simple weapon.", [{name:"Two handaxes",eval:"addWeapon(\'Handaxe\', 2)"}].concat(weapons.filter(function (entry) { return entry.simple }).map(function(element) {return {name:element.name,eval:"addWeapon(\'"+element.name+"\')"}})))'
				],
				immediate:[
					'addCurrHP(12); true',
					'addCurrHP(c.Constitutionmod); true',
					'addCurrHD("d12")',
				]
			}
		}
	}
}

function addClassLevel(cl)
{
	var o;
	var i;

	if (classes[cl] === undefined)
		throw new Error("Unknown class: "+cl);
	o = c.base.classes.find(obj => { return obj.name === cl });
	if (o === undefined) {
		o = {name:cl,level:0};
		c.base.classes.push(o);
	}
	o.level++;
	applyClassLevels.push({name:cl,level:o.level});
	classes[cl].level[o.level].changes.forEach(change=>{c.base.changes.push(change)});
}

function verifyChoose(returnArray)
{
	var i;
	var choices = parseInt(document.getElementById('choices').value, 10);
	var choose = parseInt(document.getElementById('choose').value, 10);
	var chosen=[];

	for (i=0; i<choices; i++) {
		if (document.getElementById('choose-'+i).checked)
			chosen.push(i);
	}
	if (chosen.length !== choose)
		return false;
	if (returnArray)
		return chosen;
	return true;
}
