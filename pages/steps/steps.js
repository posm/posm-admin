var Steps = {
	terminals: {}
};

Steps.openTerminals = function () {
	Steps.terminals.t1 = tty.openTerminal($('#termDiv1').position().top);
	Steps.terminals.t2 = tty.openTerminal($('#termDiv2').position().top);
	Steps.terminals.t3 = tty.openTerminal($('#termDiv3').position().top);
}

Steps.typeCommands = function() {
	tty.socket.emit('data', Steps.terminals.t1.tabs[0].id, 'ls -lah');
	tty.socket.emit('data', Steps.terminals.t2.tabs[0].id, 'pwd');
	tty.socket.emit('data', Steps.terminals.t3.tabs[0].id, 'ifconfig');
};

Steps.initExecuteButtons = function() {
	$('#t1btn').click(function() {
		tty.socket.emit('data', Steps.terminals.t1.tabs[0].id, '\r');
	});
	$('#t2btn').click(function() {
		tty.socket.emit('data', Steps.terminals.t2.tabs[0].id, '\r');
	});
	$('#t3btn').click(function() {
		tty.socket.emit('data', Steps.terminals.t3.tabs[0].id, '\r');
	});
};

$(function() {
	setTimeout(function() {
		Steps.openTerminals();
		setTimeout(function() {
			Steps.typeCommands();
			Steps.initExecuteButtons();
		}, 200);
	}, 200);
});
