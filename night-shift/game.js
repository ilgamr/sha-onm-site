/* Night Shift • Shanghai O&M
 * A build-free Canvas 2D game. Coordinates use a fixed 1280 × 720 world.
 * Pendulum integration is fixed at 120 Hz; no remote requests or libraries.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('sea'), ctx = canvas.getContext('2d');
  if (!ctx) { $('start').disabled = true; return; }
  const W = 1280, H = 720, STEP = 1 / 120;
  const CRATE = { w: 116, h: 54 }, ANCHOR = 145, DECK = 540;
  const COLUMNS = [730, 878, 1026], LOAD_X = 235;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const colors = [ ['#527b7d','#85aaa6'], ['#bd925e','#e4c28a'], ['#596e8b','#9cb0ca'], ['#a46953','#cf9c7d'], ['#658079','#a8b7a0'], ['#b59c70','#e2cba4'] ];
  const text = {
    ru: {
      language:'Язык',controls:'Управление игрой',tagline:'ТОЧНОСТЬ ПОСЛЕ ЗАКАТА.',
      afterHours:'ПОСЛЕ СМЕНЫ', berth:'ПРИЧАЛ 07',time:'ОСТАЛОСЬ',loaded:'НА БОРТУ',score:'ОЧКИ',
      intro:'Порт не спит.<br>Шесть контейнеров ждут твоей точности.',start:'Начать смену',practice:'Тренировка без таймера',startNote:'90 секунд · клавиатура или экранные кнопки',
      hold:'КРАН НА ПАУЗЕ',pauseTitle:'Порт подождёт.',pauseText:'Таймер остановлен. Продолжим, когда будешь готов.',resume:'Продолжить',restart:'Начать заново',
      briefing:'ИНСТРУКТАЖ · 20 СЕКУНД',helpTitle:'Плавно. Точно. На борт.',
      help1:'Перемести груз над свободным пунктирным местом. Стрелки ← → или A / D управляют краном.',
      help2:'Погаси раскачивание и опусти контейнер почти до палубы: ↓ / S. Поднять груз: ↑ / W.',
      help3:'Нажми Пробел, чтобы отпустить. Низкая высота и небольшая скорость дают больше очков. Новый груз подхватится сам.',
      helpTip:'Сначала заполни нижние места. На каждый контейнер можно поставить ещё один. Зелёная подсказка означает, что груз можно отпускать.',
      understood:'Всё понятно',points:'ОЧКОВ ЗА СМЕНУ',lessonTitle:'ОДНА МЫСЛЬ С СОБОЙ',
      lesson:'Чем длиннее трос, тем медленнее качается груз. Раннее плавное торможение помогает поставить его точнее.',
      again:'Ещё одна смена',home:'Вернуться в порт',move:'кран',rope:'трос',release:'отпустить',drop:'ОТПУСТИТЬ',best:'ЛИЧНЫЙ РЕКОРД',
      footer:'Маленькая смена. Большое внимание к деталям.',soundOn:'Выключить звук',soundOff:'Включить звук',help:'Как играть',fullscreen:'На весь экран',pause:'Пауза',
      left:'Кран влево',right:'Кран вправо',up:'Поднять груз',down:'Опустить груз',
      canvas:'Игровое поле. Стрелки или WASD — кран и трос. Пробел — отпустить груз. P — пауза.',
      hintMove:'Перемести груз вправо, над пунктирным местом',hintLower:'Опускай груз: ↓ / S. Ближе к палубе — мягче посадка',hintAlign:'Совмести середину груза с пунктирным местом',hintSway:'Отпусти стрелки и дай грузу успокоиться',hintReady:'Можно отпускать · ПРОБЕЛ',hintReturning:'Кран возвращается за следующим грузом',hintFalling:'Контейнер идёт на посадку',hintDepart:'Шесть из шести. Судно готово к выходу.',
      perfect:'Идеальная посадка',good:'Груз на месте',rough:'Жёсткая посадка',miss:'Мимо места',splash:'Груз упал в воду',penalty:'−100 · попробуй ещё раз',
      returning:'СЛЕДУЮЩИЙ ГРУЗ',pick:'ЗОНА ПОГРУЗКИ',bay:'МЕСТО',ready:'ГОТОВ К ПОСАДКЕ',height:'ВЫСОТА',speed:'СКОРОСТЬ',
      completed:'СМЕНА ЗАКРЫТА',timeout:'ВРЕМЯ ВЫШЛО',training:'ТРЕНИРОВКА ЗАВЕРШЕНА',winTitle:'Курс — в открытое море.',loseTitle:'Хорошее начало.',
      winText:'Все шесть контейнеров на борту. Можно выдохнуть.',loseText:'Не всё успели, но следующая смена будет точнее.',
      resultLoaded:n => `${n} / 6 на борту`, resultBest:n => `Рекорд: ${n}`, newBest:'Новый личный рекорд',bonus:n => `Бонус за время: +${n}`, practiceResult:'Без таймера · рекорд не меняется',
      tutorial:'Груз уже закреплён. Отправляйся к судну →', timeWarning:'Осталось 15 секунд',storage:'Рекорд сохраняется только в этом браузере.',
    },
    en: {
      language:'Language',controls:'Game controls',tagline:'PRECISION AFTER DARK.',
      afterHours:'AFTER HOURS',berth:'BERTH 07',time:'TIME LEFT',loaded:'ON BOARD',score:'SCORE',
      intro:'The port never sleeps.<br>Six containers. One steady hand.',start:'Start your shift',practice:'Practice without a timer',startNote:'90 seconds · keyboard or on-screen controls',
      hold:'CRANE ON STANDBY',pauseTitle:'The port can wait.',pauseText:'The clock is stopped. Carry on when you’re ready.',resume:'Resume shift',restart:'Start over',
      briefing:'YOUR 20-SECOND BRIEFING',helpTitle:'Steady. Precise. On board.',
      help1:'Move the load above an empty outlined bay. Use ← → or A / D to move the crane.',
      help2:'Let the swing settle. Lower the container close to the deck with ↓ / S. Raise it with ↑ / W.',
      help3:'Press Space to release. Low height and low speed earn more points. The next load is picked up automatically.',
      helpTip:'Fill the lower bays first. Each container can support one more. A green hint means it’s a good time to release.',
      understood:'Ready to go',points:'POINTS THIS SHIFT',lessonTitle:'TAKE THIS WITH YOU',
      lesson:'A longer cable gives the load a slower swing. Braking gently and early helps you place it more precisely.',
      again:'One more shift',home:'Back to the port',move:'move',rope:'cable',release:'release',drop:'RELEASE',best:'PERSONAL BEST',
      footer:'A little night shift. An eye for every detail.',soundOn:'Mute sound',soundOff:'Enable sound',help:'How to play',fullscreen:'Full screen',pause:'Pause',
      left:'Move crane left',right:'Move crane right',up:'Raise load',down:'Lower load',
      canvas:'Game field. Arrow keys or WASD: crane and cable. Space: release load. P: pause.',
      hintMove:'Move right, above an outlined bay',hintLower:'Lower the load: ↓ / S. Closer to the deck is softer',hintAlign:'Align the middle of the load with an outlined bay',hintSway:'Let go of the arrows and let the swing settle',hintReady:'Ready to release · SPACE',hintReturning:'Picking up your next container',hintFalling:'Container coming in to land',hintDepart:'Six out of six. Ready to sail.',
      perfect:'Perfect landing',good:'Safely on board',rough:'Hard landing',miss:'Missed the bay',splash:'Overboard',penalty:'−100 · try again',
      returning:'NEXT CONTAINER',pick:'LOADING ZONE',bay:'BAY',ready:'READY TO LAND',height:'HEIGHT',speed:'SPEED',
      completed:'SHIFT COMPLETE',timeout:'TIME’S UP',training:'PRACTICE COMPLETE',winTitle:'Bound for the open sea.',loseTitle:'A good beginning.',
      winText:'All six containers on board. Take a breath.',loseText:'A little more practice. A steadier next shift.',
      resultLoaded:n => `${n} / 6 on board`,resultBest:n => `Best: ${n}`,newBest:'New personal best',bonus:n => `Time bonus: +${n}`,practiceResult:'Untimed · no record changes',
      tutorial:'Your load is attached. Head for the ship →',timeWarning:'15 seconds left',storage:'Your best is saved in this browser only.',
    },
    zh: {
      language:'语言',controls:'游戏操作',tagline:'夜幕之下，精准依旧。',
      afterHours:'下班之后',berth:'07 号泊位',time:'剩余时间',loaded:'已装船',score:'得分',
      intro:'港口不眠。<br>六只集装箱，等你稳稳装船。',start:'开始夜班',practice:'不限时练习',startNote:'90 秒 · 键盘或屏幕按钮操作',
      hold:'起重机已暂停',pauseTitle:'港口可以等一等。',pauseText:'计时已暂停。准备好后继续。',resume:'继续夜班',restart:'重新开始',
      briefing:'20 秒操作指南',helpTitle:'稳稳吊起，精准装船。',
      help1:'将货物移到空闲的虚线框上方。使用左右方向键或 A / D 移动起重机。',
      help2:'等待摆动减弱，用下方向键或 S 将集装箱降到接近甲板的位置。用上方向键或 W 提起货物。',
      help3:'按空格键释放货物。释放高度越低、速度越慢，得分越高。起重机会自动吊起下一只集装箱。',
      helpTip:'先装满下层位置。每只集装箱上面还能叠放一只。绿色提示表示可以释放货物。',
      understood:'明白了',points:'本班得分',lessonTitle:'带走一个小知识',
      lesson:'吊索越长，货物摆动的周期越长。提前平稳减速，有助于更精准地放置货物。',
      again:'再来一班',home:'返回港口',move:'移动',rope:'吊索',release:'释放',drop:'释放货物',best:'个人最佳',
      footer:'小小夜班，细节不小。',soundOn:'关闭声音',soundOff:'开启声音',help:'操作说明',fullscreen:'全屏',pause:'暂停',
      left:'向左移动起重机',right:'向右移动起重机',up:'提起货物',down:'放低货物',
      canvas:'游戏区域。方向键或 WASD 控制起重机和吊索。空格键释放货物，P 键暂停。',
      hintMove:'向右移动到虚线框上方',hintLower:'用下方向键或 S 放低货物，越靠近甲板越平稳',hintAlign:'将货物中心对准虚线框',hintSway:'松开方向键，等待摆动减弱',hintReady:'可以释放 · 空格键',hintReturning:'起重机正在吊取下一只集装箱',hintFalling:'集装箱正在落位',hintDepart:'六只全部装船，准备启航。',
      perfect:'完美落位',good:'装船成功',rough:'落位冲击过大',miss:'未对准位置',splash:'货物落水',penalty:'−100 · 再试一次',
      returning:'下一只集装箱',pick:'装货区',bay:'装载位',ready:'可以落位',height:'高度',speed:'速度',
      completed:'夜班完成',timeout:'时间到',training:'练习完成',winTitle:'驶向大海。',loseTitle:'一个好的开始。',
      winText:'六只集装箱全部装船，可以松口气了。',loseText:'这次没能全部装完，下个夜班会更熟练。',
      resultLoaded:n => `已装船 ${n} / 6`,resultBest:n => `最佳：${n}`,newBest:'刷新个人纪录',bonus:n => `时间奖励：+${n}`,practiceResult:'不限时 · 不计入纪录',
      tutorial:'货物已固定，向右驶向货船 →',timeWarning:'还剩 15 秒',storage:'最佳成绩仅保存在此浏览器中。',
    },
    ar: {
      language:'اللغة',controls:'أزرار التحكم',tagline:'الدقة بعد حلول الظلام.',
      afterHours:'بعد ساعات العمل',berth:'الرصيف 07',time:'الوقت المتبقي',loaded:'على متن السفينة',score:'النقاط',
      intro:'الميناء لا ينام.<br>ست حاويات تنتظر دقتك.',start:'ابدأ المناوبة',practice:'تدرّب دون مؤقّت',startNote:'90 ثانية · لوحة المفاتيح أو أزرار الشاشة',
      hold:'الرافعة متوقفة مؤقتًا',pauseTitle:'الميناء يمكنه الانتظار.',pauseText:'المؤقّت متوقف. تابع عندما تكون مستعدًا.',resume:'متابعة المناوبة',restart:'ابدأ من جديد',
      briefing:'تعليمات في 20 ثانية',helpTitle:'بثبات ودقة، إلى السفينة.',
      help1:'حرّك الحمولة فوق مكان فارغ محدد بإطار متقطع. استخدم سهمَي اليمين واليسار أو A / D لتحريك الرافعة.',
      help2:'انتظر حتى يهدأ التأرجح، ثم اخفض الحاوية قرب السطح بسهم الأسفل أو S. لرفع الحمولة، استخدم سهم الأعلى أو W.',
      help3:'اضغط مفتاح المسافة لتحرير الحمولة. كلما انخفض الارتفاع والسرعة زادت النقاط. تُلتقط الحاوية التالية تلقائيًا.',
      helpTip:'املأ المواقع السفلية أولًا. يمكن وضع حاوية إضافية فوق كل حاوية. الإشارة الخضراء تعني أن الوقت مناسب لتحرير الحمولة.',
      understood:'فهمت، لنبدأ',points:'نقاط المناوبة',lessonTitle:'معلومة تأخذها معك',
      lesson:'كلما طال الحبل، طال زمن تأرجح الحمولة. يساعد التباطؤ المبكر والهادئ على وضعها بدقة أكبر.',
      again:'مناوبة أخرى',home:'العودة إلى الميناء',move:'الرافعة',rope:'الحبل',release:'تحرير الحمولة',drop:'حرّر الحمولة',best:'أفضل نتيجة',
      footer:'مناوبة صغيرة، واهتمام كبير بالتفاصيل.',soundOn:'كتم الصوت',soundOff:'تشغيل الصوت',help:'طريقة اللعب',fullscreen:'ملء الشاشة',pause:'إيقاف مؤقت',
      left:'تحريك الرافعة إلى اليسار',right:'تحريك الرافعة إلى اليمين',up:'رفع الحمولة',down:'خفض الحمولة',
      canvas:'ساحة اللعب. استخدم الأسهم أو WASD للتحكم بالرافعة والحبل. مفتاح المسافة لتحرير الحمولة، وP للإيقاف المؤقت.',
      hintMove:'حرّك الحمولة يمينًا فوق الإطار المتقطع',hintLower:'اخفض الحمولة بسهم الأسفل أو S؛ الاقتراب من السطح يجعل الهبوط ألطف',hintAlign:'حاذِ مركز الحمولة مع الإطار المتقطع',hintSway:'اترك الأسهم وانتظر حتى يهدأ التأرجح',hintReady:'جاهز للتحرير · مفتاح المسافة',hintReturning:'الرافعة تلتقط الحاوية التالية',hintFalling:'الحاوية تهبط في مكانها',hintDepart:'اكتملت الحاويات الست. السفينة جاهزة للإبحار.',
      perfect:'هبوط مثالي',good:'استقرت الحمولة بأمان',rough:'هبوط عنيف',miss:'خارج المكان المحدد',splash:'سقطت الحمولة في الماء',penalty:'\u2066−100\u2069 · حاول مجددًا',
      returning:'الحاوية التالية',pick:'منطقة التحميل',bay:'موقع',ready:'جاهز للهبوط',height:'الارتفاع',speed:'السرعة',
      completed:'اكتملت المناوبة',timeout:'انتهى الوقت',training:'اكتمل التدريب',winTitle:'نحو عرض البحر.',loseTitle:'بداية جيدة.',
      winText:'الحاويات الست على متن السفينة. خذ نفسًا واسترح.',loseText:'لم تكتمل الحمولة هذه المرة. المناوبة القادمة ستكون أدق.',
      resultLoaded:n => `\u2066${n} / 6\u2069 حاويات على متن السفينة`,resultBest:n => `أفضل نتيجة: ${n}`,newBest:'رقم شخصي جديد',bonus:n => `مكافأة الوقت: \u2066+${n}\u2069`,practiceResult:'دون مؤقّت · لا تُحتسب ضمن الأرقام القياسية',
      tutorial:'الحمولة مثبتة. اتجه يمينًا نحو السفينة',timeWarning:'تبقّت 15 ثانية',storage:'تُحفظ أفضل نتيجة في هذا المتصفح فقط.',
    }
  };
  function readStored(k, fallback) { try { return localStorage.getItem(k) || fallback; } catch (_) { return fallback; } }
  function writeStored(k, value) { try { localStorage.setItem(k, String(value)); } catch (_) { /* Private/file browsing can deny storage. */ } }
  const LANGUAGES = ['en','ru','zh','ar'];
  const LOCALES = {en:'en-US',ru:'ru-RU',zh:'zh-Hans',ar:'ar'};
  let lang = readStored('om-nightshift-language-v2','en'); if (!LANGUAGES.includes(lang)) lang = 'en';
  let best = Math.max(0, Number(readStored('om-nightshift-best','0')) || 0);
  let soundEnabled = readStored('om-nightshift-sound','off') === 'on';
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let status = 'menu', practice = false, timeLeft = 90, score = 0, loaded = 0, misses = 0;
  let slots = [0,0,0], placed = [], particles = [], floating = [];
  let phase = 'carry', dropBody = null, returnTime = 0, returnStart = null, departureTime = 0;
  let shiftTotal = 0, endInfo = null, ambientTime = 0, toastTime = 0, warningGiven = false, toastState = null;
  let crane = newCrane(), lastHint = '', activeDialog = null, previousFocus = null, helpWasRunning = false;
  let dpr = 1, viewW = W, viewH = H, cameraScale = 1, cameraX = 0, cameraY = 0;
  const keys = new Set(), inputCounts = new Map();
  const backdrop = new Image(); backdrop.src = 'assets/port-background.webp';
  function t(k) { return text[lang][k]; }
  function newCrane() { return { x:LOAD_X, vx:0, ax:0, length:170, lv:0, angle:0, omega:0 }; }
  function bob(c = crane) {
    return { x:c.x + Math.sin(c.angle) * c.length, y:ANCHOR + Math.cos(c.angle) * c.length + 12,
      vx:c.vx + Math.cos(c.angle) * c.length * c.omega + Math.sin(c.angle) * c.lv,
      vy:-Math.sin(c.angle) * c.length * c.omega + Math.cos(c.angle) * c.lv };
  }
  function freeBays() { return COLUMNS.map((x,i) => ({ x, i, y:DECK-slots[i]*CRATE.h })).filter(b => slots[b.i]<2); }
  function closestBay(x) { return freeBays().sort((a,b) => Math.abs(a.x-x)-Math.abs(b.x-x))[0] || null; }
  function landingInfo() {
    const b = bob(), bay = closestBay(b.x);
    if (!bay) return { b, ready:false, key:'hintDepart', bay:null, height:0 };
    const offset = Math.abs(b.x-bay.x), height = bay.y-(b.y+CRATE.h);
    let key = offset > 48 ? (b.x < 610 ? 'hintMove' : 'hintAlign') : height > 35 ? 'hintLower' : 'hintSway';
    const ready = offset < 25 && height >= -1 && height < 38 && Math.abs(b.vx) < 55 && Math.abs(b.vy) < 65;
    if (ready) key = 'hintReady';
    return { b, bay, height, ready, key };
  }

  // Synthesized audio keeps the distributable small and completely offline.
  let audio = null, master = null, motor = null, motorGain = null;
  function initAudio() {
    if (!soundEnabled) return;
    try {
      if (!audio) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audio = new AudioContext(); master = audio.createGain(); master.gain.value=.4; master.connect(audio.destination);
        motor = audio.createOscillator(); motor.type='triangle'; motor.frequency.value=58;
        motorGain=audio.createGain(); motorGain.gain.value=0; motor.connect(motorGain); motorGain.connect(master); motor.start();
      }
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch (_) { soundEnabled=false; updateSoundUI(); }
  }
  function tone(freq, dur, volume=.18, type='sine', delay=0, endFreq=freq) {
    if (!audio || !soundEnabled || audio.state !== 'running') return;
    const at=audio.currentTime+delay, osc=audio.createOscillator(), gain=audio.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,at); osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),at+dur);
    gain.gain.setValueAtTime(.001,at); gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+dur);
    osc.connect(gain);gain.connect(master);osc.start(at);osc.stop(at+dur+.02);
    osc.onended=() => {osc.disconnect();gain.disconnect();};
  }
  function impactSound(good) { tone(90,.23,.3,'triangle',0,35); if(good) {tone(587,.28,.1,'sine',.1);tone(880,.36,.08,'sine',.2);} else tone(110,.35,.15,'sawtooth',.1,40); }
  function updateSoundUI() { $('sound').setAttribute('aria-pressed',String(soundEnabled)); $('muteLine').hidden=soundEnabled; $('sound').title=t(soundEnabled?'soundOn':'soundOff');$('sound').setAttribute('aria-label',$('sound').title); }

  function setLanguage(next) {
    if(!LANGUAGES.includes(next))return;
    lang=next;writeStored('om-nightshift-language-v2',lang);document.documentElement.lang=LOCALES[lang];document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el=>{const value=t(el.dataset.i18n);if(typeof value==='string'){if(el.dataset.i18n==='intro')el.innerHTML=value;else el.textContent=value;}});
    $('language').value=lang;$('language').setAttribute('aria-label',t('language'));
    document.querySelector('.touch-controls').setAttribute('aria-label',t('controls'));
    ['help','fullscreen','pause'].forEach(id=>{$(id).title=t(id);$(id).setAttribute('aria-label',t(id));});
    const names={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
    document.querySelectorAll('[data-key]').forEach(el=>el.setAttribute('aria-label',t(names[el.dataset.key])));
    canvas.setAttribute('aria-label',t('canvas'));$('bestValue').title=t('storage');updateSoundUI();lastHint='';updateHUD();if(endInfo)renderEnd();if(toastState&&toastTime>0)renderToast();
  }
  function renderToast() {const {key,extra,type,penalty}=toastState;const value=penalty?t('penalty'):extra;$('toast').textContent=t(key)+(value?' · '+value:'');$('toast').className='toast visible '+type;}
  function toast(key,extra='',type='good') {toastState={key,extra,type,penalty:extra===t('penalty')};toastTime=3;renderToast();}
  function clearInputs() { keys.clear();inputCounts.clear();document.querySelectorAll('.control-key').forEach(el=>el.classList.remove('active'));crane.lv=0; }
  function showDialog(id) {
    previousFocus=document.activeElement;activeDialog=$(id);activeDialog.hidden=false;
    $('hud').inert=true;canvas.inert=true;document.querySelector('.control-desk').inert=true;
    const first=activeDialog.querySelector('button');if(first)first.focus({preventScroll:true});
  }
  function hideDialog(id) {
    $(id).hidden=true;activeDialog=null;$('hud').inert=false;canvas.inert=false;document.querySelector('.control-desk').inert=false;
    if(previousFocus && previousFocus.isConnected && !previousFocus.closest('[hidden]')) previousFocus.focus({preventScroll:true});
  }
  function startGame(isPractice) {
    clearInputs();practice=Boolean(isPractice);timeLeft=90;score=0;loaded=0;misses=0;slots=[0,0,0];placed=[];particles=[];floating=[];
    crane=newCrane();phase='carry';dropBody=null;returnTime=0;departureTime=0;warningGiven=false;endInfo=null;shiftTotal=0;
    ['pauseOverlay','helpOverlay','endOverlay'].forEach(id=>$(id).hidden=true);activeDialog=null;$('hud').inert=false;canvas.inert=false;document.querySelector('.control-desk').inert=false;
    status='running';$('startPanel').hidden=true;$('sceneCaption').hidden=true;$('playHint').hidden=false;$('pause').disabled=false;
    $('gameShell').classList.add('playing');initAudio();tone(330,.15,.07);toast('tutorial','','');lastHint='';updateHUD();canvas.focus({preventScroll:true});
  }
  function pauseGame() {
    if(status!=='running'&&status!=='departing')return;
    clearInputs();status=status==='departing'?'pausedDepart':'paused';showDialog('pauseOverlay');
  }
  function resumeGame() { if(status!=='paused'&&status!=='pausedDepart')return;hideDialog('pauseOverlay');status=status==='pausedDepart'?'departing':'running';clearInputs();canvas.focus({preventScroll:true});initAudio(); }
  function openHelp() {
    if(activeDialog) return;
    helpWasRunning=status==='running'||status==='departing';if(helpWasRunning){status=status==='departing'?'helpDepart':'help';clearInputs();}
    showDialog('helpOverlay');
  }
  function closeHelp() { hideDialog('helpOverlay');if(helpWasRunning){status=status==='helpDepart'?'departing':'running';canvas.focus({preventScroll:true});}helpWasRunning=false; }
  function goHome() {
    if(activeDialog)hideDialog(activeDialog.id);clearInputs();status='menu';crane=newCrane();loaded=0;score=0;timeLeft=90;slots=[0,0,0];placed=[];phase='carry';particles=[];floating=[];dropBody=null;endInfo=null;
    $('startPanel').hidden=false;$('sceneCaption').hidden=false;$('playHint').hidden=true;$('pause').disabled=true;$('toast').className='toast';$('gameShell').classList.remove('playing');updateHUD();$('start').focus({preventScroll:true});
  }
  function finish(win) {
    status='ended';clearInputs();$('pause').disabled=true;$('playHint').hidden=true;
    const bonus=win&&!practice?Math.floor(timeLeft)*10:0;score+=bonus;
    const isBest=!practice&&score>best;if(isBest){best=score;writeStored('om-nightshift-best',best);}
    endInfo={win,bonus,isBest};renderEnd();updateHUD();showDialog('endOverlay');
    if(win){tone(392,.6,.1);tone(494,.6,.09,'sine',.15);tone(587,.8,.09,'sine',.3);}
  }
  function renderEnd() {
    if(!endInfo)return;
    $('endEyebrow').textContent=t(practice?'training':endInfo.win?'completed':'timeout');
    $('endTitle').textContent=t(endInfo.win?'winTitle':'loseTitle');$('endDescription').textContent=t(endInfo.win?'winText':'loseText');
    $('endScore').textContent=score.toLocaleString(LOCALES[lang]);$('endLoaded').textContent=t('resultLoaded')(loaded);
    $('endBest').textContent=practice?t('practiceResult'):endInfo.isBest?t('newBest'):t('resultBest')(best);
    if(endInfo.bonus)$('endDescription').textContent+=' '+t('bonus')(endInfo.bonus)+'.';
  }
  function updateHUD() {
    const secs=Math.ceil(timeLeft);$('timeValue').textContent=practice&&status!=='menu'?'∞':`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
    $('timeValue').classList.toggle('urgent',!practice&&timeLeft<=15&&status!=='menu');$('loadedValue').textContent=loaded;
    $('scoreValue').textContent=String(score).padStart(4,'0');$('bestValue').textContent=best?String(best):'—';
  }
  function release() {
    if(status!=='running'||phase!=='carry')return;
    const b=bob();dropBody={x:b.x,y:b.y,vx:b.vx,vy:Math.max(b.vy,-70),angle:crane.angle*.15,spin:crane.omega*.1,color:loaded%6};
    phase='fall';tone(170,.1,.08,'triangle');clearInputs();
  }
  function beginReturn() { phase='return';returnTime=0;returnStart={x:crane.x,length:crane.length,angle:crane.angle};dropBody=null; }
  function makeParticles(x,y,good,splash=false) {
    for(let i=0;i<(reducedMotion?5:22);i++)particles.push({x,y,vx:(Math.random()-.5)*(splash?170:120),vy:-Math.random()*(splash?160:80)-20,life:.6+Math.random()*.5,max:1.1,color:splash?'#77b2bf':good?'#e8c889':'#d29377',size:splash?3:2});
  }
  function land(body, surface) {
    const bay=freeBays().find(b=>Math.abs(b.y-surface)<1&&Math.abs(body.x-b.x)<30);
    const gentle=Math.abs(body.vx)<100&&body.vy<280&&Math.abs(body.angle)<.23;
    if(bay&&gentle){
      const precision=1-Math.min(1,Math.abs(body.x-bay.x)/30);
      const softness=1-Math.min(1,Math.max(0,body.vy)/280);
      const steadiness=1-Math.min(1,Math.abs(body.vx)/100);
      const points=Math.round((400+precision*300+softness*200+steadiness*100)/10)*10;
      score+=points;loaded++;slots[bay.i]++;placed.push({x:bay.x,y:bay.y-CRATE.h,color:body.color});
      toast(points>=900?'perfect':'good','+'+points,'good');floating.push({x:bay.x,y:bay.y-CRATE.h-22,label:'+'+points,life:1.8});
      impactSound(true);makeParticles(bay.x,bay.y,true);
      if(loaded===6){phase='done';status='departing';departureTime=0;dropBody=null;clearInputs();tone(98,1.6,.12,'triangle',.3,82);}
      else beginReturn();
    }else{
      misses++;score=Math.max(0,score-100);toast(bay?'rough':'miss',t('penalty'),'bad');impactSound(false);makeParticles(body.x,surface,false);beginReturn();
    }
    updateHUD();
  }
  function updateCrane(dt) {
    const direction=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);
    const lift=(keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0);
    const oldVX=crane.vx;const wanted=direction*190;
    crane.vx+=(wanted-crane.vx)*Math.min(1,dt*(direction?2.5:3.8));crane.ax=(crane.vx-oldVX)/dt;
    crane.x+=crane.vx*dt;
    if(crane.x<165||crane.x>1120){crane.x=clamp(crane.x,165,1120);crane.vx=0;}
    const oldL=crane.length;crane.lv=lift*92;crane.length=clamp(crane.length+crane.lv*dt,95,435);crane.lv=(crane.length-oldL)/dt;
    const alpha=-(520/crane.length)*Math.sin(crane.angle)-(crane.ax/crane.length)*Math.cos(crane.angle)-.85*crane.omega-2*(crane.lv/crane.length)*crane.omega;
    crane.omega+=alpha*dt;crane.angle+=crane.omega*dt;crane.angle=clamp(crane.angle,-.65,.65);
    if(phase==='carry'){
      const b=bob();let floor=650;
      if(b.x+CRATE.w/2>620&&b.x-CRATE.w/2<1150)floor=DECK;
      if(b.x-CRATE.w/2<355)floor=590;
      for(const box of placed)if(Math.abs(b.x-box.x)<CRATE.w-2)floor=Math.min(floor,box.y);
      if(b.y+CRATE.h>floor){crane.length=Math.max(95,(floor-CRATE.h-12-ANCHOR)/Math.cos(crane.angle));crane.lv=Math.min(0,crane.lv);}
    }
  }
  function step(dt) {
    if(status==='running') {
      shiftTotal+=dt;if(!practice){timeLeft=Math.max(0,timeLeft-dt);if(timeLeft<=15&&!warningGiven){warningGiven=true;toast('timeWarning','','');tone(660,.12,.08);}if(timeLeft<=0){finish(false);return;}}
      if(phase==='carry')updateCrane(dt);
      else if(phase==='fall'){
        const b=dropBody,oldBottom=b.y+CRATE.h;
        b.vy+=520*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.exp(-.1*dt);b.angle+=b.spin*dt;
        let surfaces=[];
        if(b.x+CRATE.w/2>620&&b.x-CRATE.w/2<1150)surfaces.push(DECK);
        placed.forEach(p=>{if(Math.abs(b.x-p.x)<CRATE.w-4)surfaces.push(p.y);});
        const floor=surfaces.sort((a,c)=>a-c).find(y=>oldBottom<=y+1&&b.y+CRATE.h>=y);
        if(floor!==undefined&&b.vy>=0)land(b,floor);
        else if(b.y+CRATE.h>642){makeParticles(b.x,638,false,true);misses++;score=Math.max(0,score-100);toast('splash',t('penalty'),'bad');impactSound(false);beginReturn();}
      }else if(phase==='return'){
        returnTime+=dt;const k=clamp(returnTime/1.6,0,1);
        crane.x=mix(returnStart.x,LOAD_X,ease(k));crane.length=mix(returnStart.length,170,ease(clamp(k*1.8,0,1)));crane.angle=returnStart.angle*(1-ease(k));crane.omega=0;crane.vx=0;crane.lv=0;
        if(k>=1){crane=newCrane();phase='carry';}
      }
    }else if(status==='departing'){
      departureTime+=dt;crane.length=Math.max(95,crane.length-dt*70);if(departureTime>4.2)finish(true);
    }
    if(status==='running'||status==='departing'||status==='menu'){
      for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;}particles=particles.filter(p=>p.life>0);
      for(const f of floating){f.life-=dt;f.y-=dt*25;}floating=floating.filter(f=>f.life>0);
      if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').className='toast';}
    }
  }

  // Drawing helpers. The moving scene is functional game geometry; the harbor
  // artwork is a locally bundled, original generated raster background.
  function line(x1,y1,x2,y2,color,width=1) { ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke(); }
  function rect(x,y,w,h,color) {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
  function label(value,x,y,size=12,color='#c3d5db',align='left',font='Arial') {ctx.direction=/[\u0600-\u06ff]/.test(value)?'rtl':'ltr';ctx.font=`${size}px ${font}`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(value,x,y);}
  function path(points,fill,stroke=null,width=1) {ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function lamp(x,y,r=22,color='rgba(233,184,103,.18)') {const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(233,184,103,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);rect(x-2,y-1,4,2,'#f1d097');}
  function container(x,y,colorIndex,angle=0,alpha=1) {
    ctx.save();ctx.translate(x,y+CRATE.h/2);ctx.rotate(angle);ctx.globalAlpha=alpha;
    const [base,edge]=colors[colorIndex%colors.length],cw=CRATE.w,ch=CRATE.h;
    const g=ctx.createLinearGradient(0,-ch/2,0,ch/2);g.addColorStop(0,edge);g.addColorStop(.12,base);g.addColorStop(1,'#203844');
    rect(-cw/2,-ch/2,cw,ch,g);rect(-cw/2,-ch/2,cw,3,edge);rect(-cw/2,ch/2-4,cw,4,'#172b36');
    for(let i=-cw/2+9;i<cw/2-5;i+=10){line(i,-ch/2+5,i,ch/2-5,'#0b2239',2);line(i+2,-ch/2+5,i+2,ch/2-5,edge,.7);}
    rect(-cw/2+3,-ch/2+4,3,ch-8,'#b3b7a2');rect(cw/2-6,-ch/2+4,3,ch-8,'#b3b7a2');
    rect(-23,-8,46,17,'rgba(15,37,46,.65)');label('O&M',0,4,10,'#e7e1ca','center');
    [[-cw/2,-ch/2],[cw/2-5,-ch/2],[-cw/2,ch/2-5],[cw/2-5,ch/2-5]].forEach(p=>rect(p[0],p[1],5,5,'#c0b293'));
    ctx.restore();
  }
  function drawBackground() {
    rect(0,0,W,H,'#0d263e');
    if(backdrop.complete&&backdrop.naturalWidth)ctx.drawImage(backdrop,0,0,W,H);
    const fog=ctx.createLinearGradient(0,0,0,H);fog.addColorStop(0,'rgba(4,15,24,.16)');fog.addColorStop(.65,'rgba(8,27,41,.06)');fog.addColorStop(1,'rgba(5,24,34,.6)');rect(0,0,W,H,fog);
    if(!reducedMotion){
      for(let i=0;i<28;i++){const y=574+i*5.4,x=(i*173)%1280+Math.sin(ambientTime*.4+i)*22;line(x,y,x+30+(i%5)*13,y,`rgba(135,179,196,${.035+(i%3)*.017})`,1);}
    }
  }
  function drawPier() {
    path([[0,584],[333,584],[376,610],[0,610]],'#45535a');rect(0,610,357,110,'#142c3a');rect(0,585,337,5,'#b4a684');
    for(let i=0;i<8;i++){rect(25+i*43,613,17,107,'#0b1f2b');line(24+i*43,616,24+i*43,718,'#53616a',2);}
    rect(174,559,116,25,'#273c45');rect(174,559,116,3,'#c4a776');
    for(let x=180;x<290;x+=16)path([[x,563],[x+7,563],[x-1,580],[x-8,580]],'#947c51');
    label(t('pick'),232,618,10,'#8397a1','center');label('07',28,653,32,'#87928a');
    rect(317,507,5,77,'#334f5b');line(306,507,334,507,'#baac86',3);lamp(318,510,40);
  }
  function shipOffset() { return (status==='departing'||status==='pausedDepart'||status==='helpDepart'||(status==='ended'&&endInfo&&endInfo.win))?ease(clamp(departureTime/6,0,1))*570:0; }
  function drawShip() {
    const off=shipOffset();ctx.save();ctx.translate(off,0);
    path([[586,544],[1172,544],[1154,592],[1110,624],[637,624],[611,592]],'#143b4c','#4c7180',1.5);
    path([[611,593],[1151,593],[1110,624],[637,624]],'#15232d');line(624,611,1130,611,'#a65e4e',3);
    rect(614,534,540,10,'#8d927e');rect(624,539,520,5,'#2b4350');line(640,547,1138,547,'#b7b293',1);
    // Bridge and navigation lights remain outside the six playable bays.
    path([[1135,531],[1135,442],[1192,442],[1192,532]],'#b0b6a9','#354e58',2);rect(1127,438,72,9,'#677f86');
    rect(1142,454,13,13,'#c4b784');rect(1160,454,13,13,'#d7c593');rect(1178,454,9,13,'#8aa5ad');
    rect(1145,482,36,29,'#586f75');line(1177,438,1177,416,'#b6bcad',3);lamp(1177,416,15);lamp(1130,440,14);
    for(let i=0;i<8;i++){rect(658+i*62,558,18,5,'#061b28');}
    label('O&M  /  SHANGHAI',692,586,15,'#bdc7bf');label('07',1084,586,20,'#bdc7bf');
    placed.forEach(p=>container(p.x,p.y,p.color));
    if(status!=='departing'&&status!=='ended'&&status!=='pausedDepart'&&status!=='helpDepart'){
      const info=status==='running'&&phase==='carry'?landingInfo():null;
      freeBays().forEach(b=>{
        const selected=info&&info.bay&&info.bay.i===b.i&&Math.abs(info.b.x-b.x)<50;
        const color=selected&&info.ready?'#9bdfc0':selected?'#e4c183':'rgba(163,193,202,.45)';
        ctx.setLineDash([6,6]);ctx.strokeStyle=color;ctx.lineWidth=selected?2:1;ctx.strokeRect(b.x-CRATE.w/2,b.y-CRATE.h,CRATE.w,CRATE.h);ctx.setLineDash([]);
        if(selected){rect(b.x-CRATE.w/2,b.y-CRATE.h,CRATE.w,CRATE.h,info.ready?'rgba(129,223,181,.10)':'rgba(226,189,113,.06)');}
        label(`${String(b.i+1).padStart(2,'0')}${slots[b.i]?' ↑':''}`,b.x,b.y-21,11,color,'center','Courier New');
      });
    }
    ctx.restore();
    if(off>0&&!reducedMotion){for(let i=0;i<5;i++)line(595+off-i*24,638+i*3,550+off-i*32,638+i*3,`rgba(158,199,210,${.18-i*.025})`,2);}
  }
  function drawCrane(menu=false) {
    // Menu parks the trolley over the ship, leaving room for the title.
    const c=menu?{x:877,vx:0,length:155,angle:reducedMotion?0:Math.sin(ambientTime*.8)*.027,omega:0,lv:0}:crane;
    const b=bob(c);
    ctx.save();
    // Twin tapered legs and diagonal bracing.
    path([[88,574],[109,574],[174,149],[156,149]],'#273f49','#70827e',1);
    path([[312,575],[336,575],[202,149],[183,149]],'#334c53','#84918a',1);
    line(112,528,294,489,'#8e987f',3);line(122,464,273,422,'#576e71',3);line(131,405,252,356,'#576e71',3);line(143,323,225,275,'#576e71',3);
    rect(80,574,40,12,'#1d333e');rect(301,574,45,12,'#1d333e');
    // Truss: decorative diagonal members follow the real game rail.
    rect(76,107,1123,9,'#84978f');rect(76,137,1123,9,'#b49c6d');
    for(let x=78;x<1172;x+=48){line(x,116,x+24,137,'#69827f',2);line(x+24,137,x+48,116,'#69827f',2);}
    rect(76,105,10,44,'#a8aa8c');rect(1190,105,10,44,'#a8aa8c');
    path([[135,107],[175,36],[204,36],[267,107]],'#334c53','#91a199',2);line(190,38,1040,106,'#95a396',1.5);line(176,41,78,106,'#95a396',2);
    rect(165,35,51,5,'#bdaf87');lamp(190,32,23,'rgba(240,104,77,.17)');
    label('SHANGHAI O&M',372,102,11,'#a7b7ad');label('07',150,193,17,'#d0b980');
    for(let x=386;x<1190;x+=198)lamp(x,148,25);
    // Small trolley and lit operator cabin.
    rect(c.x-27,120,54,24,'#bcb292');rect(c.x-33,140,66,7,'#6c8284');rect(c.x-18,111,36,8,'#425762');
    rect(c.x-31,149,23,25,'#c4b692');rect(c.x-28,153,17,11,'#8fabb2');rect(c.x-28,153,17,3,'#d5d7b1');
    lamp(c.x,149,40);
    // Parallel lines keep the load horizontal while its suspension swings.
    line(c.x-11,ANCHOR,b.x-35,b.y-10,'#a0b0b0',1.5);line(c.x+11,ANCHOR,b.x+35,b.y-10,'#a0b0b0',1.5);
    rect(b.x-45,b.y-11,90,8,'#d3b274');rect(b.x-42,b.y-3,7,8,'#6d7b71');rect(b.x+35,b.y-3,7,8,'#6d7b71');
    if(menu||phase==='carry')container(b.x,b.y,loaded%6,c.angle*.12);
    if(!menu&&phase==='carry'&&status==='running'){
      const info=landingInfo();
      if(info.bay&&Math.abs(b.x-info.bay.x)<60){
        const floor=info.bay.y;ctx.setLineDash([3,7]);line(b.x,b.y+CRATE.h+5,b.x,floor,info.ready?'#8ddab5':'rgba(207,185,136,.65)',1);ctx.setLineDash([]);
        if(info.height>48)label('↓',b.x,floor-CRATE.h-13,18,'#cfb783','center');
      }
      // A compact instrument follows the trolley; no physical units are implied.
      const sx=clamp(b.x+80,170,1090),sy=clamp(b.y+5,190,460);
      rect(sx,sy,90,38,'rgba(9,29,40,.78)');label(t('speed'),sx+8,sy+12,8,'#8ea8b4');
      const speed=clamp(Math.abs(b.vx)/180,0,1);rect(sx+8,sy+23,70,3,'#355362');rect(sx+8,sy+23,70*speed,3,speed<.3?'#9bdfc0':'#d9af72');
    }
    ctx.restore();
  }
  function draw() {
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,viewW,viewH);ctx.fillStyle='#0a1d2b';ctx.fillRect(0,0,viewW,viewH);
    ctx.translate(cameraX,cameraY);ctx.scale(cameraScale,cameraScale);drawBackground();drawPier();drawShip();drawCrane(status==='menu');
    if(dropBody)container(dropBody.x,dropBody.y,dropBody.color,dropBody.angle);
    for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);rect(p.x,p.y,p.size,p.size,p.color);}ctx.globalAlpha=1;
    for(const f of floating){ctx.globalAlpha=clamp(f.life,0,1);label(f.label,f.x,f.y,22,'#e4c68b','center','Courier New');}ctx.globalAlpha=1;
    if(status==='menu'){
      const shade=ctx.createLinearGradient(0,0,830,0);shade.addColorStop(0,'rgba(17,40,47,.99)');shade.addColorStop(.55,'rgba(17,40,47,.94)');shade.addColorStop(1,'rgba(17,40,47,0)');rect(0,0,900,H,shade);
    }
    if(status==='running'||status==='departing'){
      const key=status==='departing'?'hintDepart':phase==='return'?'hintReturning':phase==='fall'?'hintFalling':landingInfo().key;
      if(key!==lastHint){$('hintText').textContent=t(key);$('playHint').classList.toggle('ready',key==='hintReady');lastHint=key;}
    }
  }
  function resize() {
    const r=canvas.getBoundingClientRect();viewW=Math.max(1,r.width);viewH=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(viewW*dpr);canvas.height=Math.round(viewH*dpr);
    cameraScale=Math.min(viewW/W,viewH/H);cameraX=(viewW-W*cameraScale)/2;cameraY=(viewH-H*cameraScale)/2;
  }
  let lastTime=0,accumulator=0,hudAccumulator=0;
  function frame(now) {
    if(!lastTime)lastTime=now;const dt=Math.min((now-lastTime)/1000,.08);lastTime=now;
    if(!document.hidden){ambientTime+=dt;accumulator+=dt;while(accumulator>=STEP){step(STEP);accumulator-=STEP;}hudAccumulator+=dt;if(hudAccumulator>.1){updateHUD();hudAccumulator=0;}draw();}
    if(motorGain&&audio){const moving=soundEnabled&&status==='running'&&phase==='carry';motorGain.gain.setTargetAtTime(moving?Math.min(.06,(Math.abs(crane.vx)+Math.abs(crane.lv))*.0003):0,audio.currentTime,.1);motor.frequency.setTargetAtTime(48+Math.abs(crane.vx)*.15,audio.currentTime,.1);}
    requestAnimationFrame(frame);
  }
  function mappedKey(code) {return {KeyA:'ArrowLeft',KeyD:'ArrowRight',KeyW:'ArrowUp',KeyS:'ArrowDown'}[code]||code;}
  document.addEventListener('keydown',e=>{
    if(e.target instanceof HTMLElement && e.target.closest('select'))return;
    if(activeDialog&&e.key==='Tab'){
      const focusable=Array.from(activeDialog.querySelectorAll('button:not(:disabled),a[href]'));if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;
    }
    if(e.code==='Escape'){if(activeDialog&&activeDialog.id==='helpOverlay')closeHelp();else if(status==='paused'||status==='pausedDepart')resumeGame();else pauseGame();return;}
    if(e.code==='KeyP'&&!e.repeat){if(status==='paused'||status==='pausedDepart')resumeGame();else pauseGame();return;}
    if(e.code==='KeyM'&&!e.repeat&&!activeDialog){$('sound').click();return;}
    // Let focused buttons keep their normal Space/Enter activation.
    if(e.target instanceof HTMLElement && e.target.closest('button,a,input,select,textarea'))return;
    const key=mappedKey(e.code);
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(key)&&status==='running'){
      e.preventDefault();if(key==='Space'){if(!e.repeat)release();}else keys.add(key);
    }
    if(e.code==='Enter'&&status==='menu')startGame(false);
  });
  document.addEventListener('keyup',e=>keys.delete(mappedKey(e.code)));
  window.addEventListener('blur',()=>{clearInputs();pauseGame();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInputs();pauseGame();}lastTime=0;accumulator=0;});
  document.querySelectorAll('[data-key]').forEach(el=>{
    el.addEventListener('pointerdown',e=>{if(status!=='running')return;e.preventDefault();el.setPointerCapture(e.pointerId);keys.add(el.dataset.key);inputCounts.set(e.pointerId,el.dataset.key);el.classList.add('active');initAudio();});
    const up=e=>{const key=inputCounts.get(e.pointerId);if(key){keys.delete(key);inputCounts.delete(e.pointerId);}el.classList.remove('active');};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
  });
  $('start').addEventListener('click',()=>startGame(false));$('practice').addEventListener('click',()=>startGame(true));
  $('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',resumeGame);$('restartPause').addEventListener('click',()=>startGame(practice));
  $('help').addEventListener('click',openHelp);$('closeHelp').addEventListener('click',closeHelp);$('again').addEventListener('click',()=>startGame(practice));$('home').addEventListener('click',goHome);
  $('drop').addEventListener('click',()=>{release();canvas.focus({preventScroll:true});});
  $('language').addEventListener('change',e=>{clearInputs();setLanguage(e.target.value);if(status==='running')canvas.focus({preventScroll:true});});
  $('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;writeStored('om-nightshift-sound',soundEnabled?'on':'off');if(soundEnabled){initAudio();tone(440,.12,.07);}updateSoundUI();if(status==='running')canvas.focus({preventScroll:true});});
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('app').requestFullscreen)await $('app').requestFullscreen();}catch(_){$('fullscreen').hidden=true;}});
  if(!$('app').requestFullscreen)$('fullscreen').hidden=true;
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe($('stage'));else window.addEventListener('resize',resize);
  setLanguage(lang);resize();requestAnimationFrame(frame);

  // Optional WebMCP: feature-detected, and never needed to run the game.
  const modelContext=document.modelContext;
  if(modelContext&&typeof modelContext.registerTool==='function'){
    const readState=()=>({status,mode:practice?'practice':'timed',secondsRemaining:Math.round(timeLeft),loaded,score,best});
    const specs=[
      {name:'night_shift_read_state',description:'Read the current Night Shift game state and score.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>readState()},
      {name:'night_shift_start',description:'Start or restart Night Shift in timed or practice mode. Resets the current round.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['timed','practice']}},required:['mode'],additionalProperties:false},execute:input=>{if(!input||!['timed','practice'].includes(input.mode)||Object.keys(input).length!==1)throw new Error('mode must be timed or practice');startGame(input.mode==='practice');return readState();}}
    ];
    for(const spec of specs)try{Promise.resolve(modelContext.registerTool(spec)).catch(()=>{});}catch(_){/* Unsupported draft implementation. */}
  }
})();
