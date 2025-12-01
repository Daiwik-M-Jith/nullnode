// Terminal Simulator Component
class Terminal {
    constructor(containerId) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!this.container) {
            console.error('Terminal container not found:', containerId);
            return;
        }
        this.history = [];
        this.historyIndex = -1;
        this.currentPath = '~';
        this.fileSystem = this.initFileSystem();
        this.setupTerminal();
    }

    initFileSystem() {
        return {
            '~': {
                type: 'dir',
                contents: {
                    'documents': { type: 'dir', contents: {} },
                    'downloads': { type: 'dir', contents: {} },
                    'welcome.txt': { type: 'file', content: 'Welcome to NullSector Terminal Simulator!\nType "help" for available commands.' }
                }
            }
        };
    }

    setupTerminal() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="terminal-buttons">
                        <span class="terminal-button close"></span>
                        <span class="terminal-button minimize"></span>
                        <span class="terminal-button maximize"></span>
                    </div>
                    <span class="terminal-title">Terminal</span>
                </div>
                <div class="terminal-body">
                    <div class="terminal-output"></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">user@nullsector:${this.currentPath}$</span>
                        <input type="text" class="terminal-input" autofocus autocomplete="off" spellcheck="false">
                    </div>
                </div>
            </div>
        `;

        this.output = this.container.querySelector('.terminal-output');
        this.input = this.container.querySelector('.terminal-input');
        this.prompt = this.container.querySelector('.terminal-prompt');

        if (!this.input || !this.output) {
            console.error('Terminal elements not found');
            return;
        }

        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.container.addEventListener('click', () => this.input.focus());

        this.writeLine('NullSector Interactive Terminal v1.0');
        this.writeLine('Type "help" to see available commands.\n');
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (command) {
                this.history.push(command);
                this.historyIndex = this.history.length;
                this.executeCommand(command);
            }
            this.input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autoComplete();
        }
    }

    executeCommand(commandLine) {
        this.writeLine(`<span class="terminal-prompt">user@nullsector:${this.currentPath}$</span> ${commandLine}`);

        const [command, ...args] = commandLine.split(' ');

        switch (command.toLowerCase()) {
            case 'help':
                this.showHelp();
                break;
            case 'clear':
                this.clear();
                break;
            case 'ls':
                this.ls(args);
                break;
            case 'pwd':
                this.pwd();
                break;
            case 'whoami':
                this.whoami();
                break;
            case 'date':
                this.date();
                break;
            case 'echo':
                this.echo(args.join(' '));
                break;
            case 'cat':
                this.cat(args[0]);
                break;
            case 'uname':
                this.uname(args);
                break;
            case 'ifconfig':
            case 'ip':
                this.ifconfig();
                break;
            case 'ping':
                this.ping(args[0]);
                break;
            case 'nmap':
                this.nmap(args);
                break;
            case 'netstat':
                this.netstat();
                break;
            case 'ps':
                this.ps();
                break;
            case 'top':
                this.top();
                break;
            case 'curl':
                this.curl(args[0]);
                break;
            case 'wget':
                this.wget(args[0]);
                break;
            case 'python':
            case 'python3':
                this.python(args);
                break;
            case 'node':
                this.node(args);
                break;
            case 'gcc':
                this.gcc(args);
                break;
            case 'man':
                this.man(args[0]);
                break;
            case 'history':
                this.showHistory();
                break;
            default:
                this.writeLine(`<span class="terminal-error">Command not found: ${command}</span>`);
                this.writeLine('Type "help" to see available commands.');
        }

        this.writeLine('');
    }

    showHelp() {
        const commands = [
            ['help', 'Show this help message'],
            ['clear', 'Clear the terminal screen'],
            ['ls', 'List directory contents'],
            ['pwd', 'Print working directory'],
            ['cat [file]', 'Display file contents'],
            ['echo [text]', 'Display a line of text'],
            ['whoami', 'Display current user'],
            ['date', 'Display current date and time'],
            ['uname', 'Print system information'],
            ['ifconfig/ip', 'Display network configuration'],
            ['ping [host]', 'Send ICMP packets to network host'],
            ['nmap [target]', 'Network exploration and security auditing'],
            ['netstat', 'Display network connections'],
            ['ps', 'Display currently running processes'],
            ['top', 'Display system resource usage'],
            ['curl [url]', 'Transfer data from URL'],
            ['wget [url]', 'Download files from the web'],
            ['python [file]', 'Run Python script'],
            ['node [file]', 'Run JavaScript with Node.js'],
            ['gcc [file]', 'GNU C Compiler'],
            ['man [command]', 'Display manual for command'],
            ['history', 'Show command history']
        ];

        this.writeLine('<span class="terminal-success">Available Commands:</span>');
        commands.forEach(([cmd, desc]) => {
            this.writeLine(`  <span class="terminal-command">${cmd.padEnd(20)}</span> ${desc}`);
        });
    }

    clear() {
        this.output.innerHTML = '';
    }

    ls(args) {
        const files = ['documents', 'downloads', 'welcome.txt', 'notes.txt', 'script.py'];
        const colors = files.map(f => f.includes('.') ? 
            `<span class="terminal-file">${f}</span>` : 
            `<span class="terminal-dir">${f}/</span>`
        );
        this.writeLine(colors.join('  '));
    }

    pwd() {
        this.writeLine(`/home/user${this.currentPath !== '~' ? '/' + this.currentPath : ''}`);
    }

    whoami() {
        this.writeLine('user');
    }

    date() {
        this.writeLine(new Date().toString());
    }

    echo(text) {
        this.writeLine(text);
    }

    cat(filename) {
        if (!filename) {
            this.writeLine('<span class="terminal-error">cat: missing file operand</span>');
            return;
        }
        if (filename === 'welcome.txt') {
            this.writeLine('Welcome to NullSector Terminal Simulator!');
            this.writeLine('This is an interactive learning environment.');
            this.writeLine('Practice your command-line skills here safely!');
        } else {
            this.writeLine(`<span class="terminal-error">cat: ${filename}: No such file or directory</span>`);
        }
    }

    uname(args) {
        if (args.includes('-a')) {
            this.writeLine('Linux nullsector 5.15.0-nullsector #1 SMP x86_64 GNU/Linux');
        } else {
            this.writeLine('Linux');
        }
    }

    ifconfig() {
        this.writeLine('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500');
        this.writeLine('        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255');
        this.writeLine('        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>');
        this.writeLine('        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)');
        this.writeLine('        RX packets 12345  bytes 8901234 (8.9 MB)');
        this.writeLine('        TX packets 9876  bytes 5432109 (5.4 MB)');
    }

    ping(host) {
        if (!host) {
            this.writeLine('<span class="terminal-error">ping: usage error: destination required</span>');
            return;
        }
        this.writeLine(`PING ${host} (93.184.216.34) 56(84) bytes of data.`);
        for (let i = 1; i <= 4; i++) {
            this.writeLine(`64 bytes from ${host} (93.184.216.34): icmp_seq=${i} ttl=56 time=${(Math.random() * 50 + 10).toFixed(1)} ms`);
        }
        this.writeLine(`\n--- ${host} ping statistics ---`);
        this.writeLine('4 packets transmitted, 4 received, 0% packet loss, time 3003ms');
        this.writeLine('rtt min/avg/max/mdev = 15.3/28.7/45.2/12.1 ms');
    }

    nmap(args) {
        const target = args[0] || '192.168.1.1';
        this.writeLine('Starting Nmap 7.94 ( https://nmap.org )');
        this.writeLine(`Nmap scan report for ${target}`);
        this.writeLine('Host is up (0.0012s latency).');
        this.writeLine('Not shown: 996 closed ports');
        this.writeLine('PORT     STATE SERVICE');
        this.writeLine('22/tcp   open  ssh');
        this.writeLine('80/tcp   open  http');
        this.writeLine('443/tcp  open  https');
        this.writeLine('3306/tcp open  mysql');
        this.writeLine('\nNmap done: 1 IP address (1 host up) scanned in 0.28 seconds');
    }

    netstat() {
        this.writeLine('Active Internet connections (only servers)');
        this.writeLine('Proto Recv-Q Send-Q Local Address           Foreign Address         State');
        this.writeLine('tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN');
        this.writeLine('tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN');
        this.writeLine('tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN');
        this.writeLine('tcp6       0      0 :::22                   :::*                    LISTEN');
    }

    ps() {
        this.writeLine('  PID TTY          TIME CMD');
        this.writeLine(' 1234 pts/0    00:00:00 bash');
        this.writeLine(' 5678 pts/0    00:00:01 python3');
        this.writeLine(' 9012 pts/0    00:00:00 ps');
    }

    top() {
        this.writeLine('top - 14:32:15 up 2 days, 3:45, 1 user, load average: 0.15, 0.25, 0.20');
        this.writeLine('Tasks: 145 total,   1 running, 144 sleeping,   0 stopped,   0 zombie');
        this.writeLine('%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.5 id,  0.1 wa,  0.0 hi,  0.1 si');
        this.writeLine('MiB Mem :   8192.0 total,   2048.5 free,   3072.2 used,   3071.3 buff/cache');
        this.writeLine('\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND');
        this.writeLine(' 1234 user      20   0  234532  45678   8901 S   2.3   0.5   0:15.32 python3');
        this.writeLine(' 5678 user      20   0  123456  23456   4567 S   1.7   0.3   0:08.17 node');
    }

    curl(url) {
        if (!url) {
            this.writeLine('<span class="terminal-error">curl: no URL specified</span>');
            return;
        }
        this.writeLine('<!DOCTYPE html>');
        this.writeLine('<html><head><title>Example Page</title></head>');
        this.writeLine('<body><h1>Hello from ' + url + '</h1></body></html>');
    }

    wget(url) {
        if (!url) {
            this.writeLine('<span class="terminal-error">wget: missing URL</span>');
            return;
        }
        this.writeLine(`--2025-12-01 14:32:15--  ${url}`);
        this.writeLine(`Resolving ${url}... 93.184.216.34`);
        this.writeLine(`Connecting to ${url}|93.184.216.34|:80... connected.`);
        this.writeLine('HTTP request sent, awaiting response... 200 OK');
        this.writeLine('Length: 1256 (1.2K) [text/html]');
        this.writeLine(`Saving to: 'index.html'`);
        this.writeLine('\n100%[===================>] 1,256       --.-K/s   in 0s');
        this.writeLine("\n2025-12-01 14:32:15 (52.3 MB/s) - 'index.html' saved [1256/1256]");
    }

    python(args) {
        if (args.length === 0 || args[0] === '--version') {
            this.writeLine('Python 3.10.12');
        } else if (args[0] === '-c') {
            const code = args.slice(1).join(' ');
            if (code.includes('print')) {
                const match = code.match(/print\(['"](.+?)['"]\)/);
                if (match) {
                    this.writeLine(match[1]);
                }
            } else {
                this.writeLine('<span class="terminal-success">Code executed successfully</span>');
            }
        } else {
            this.writeLine(`python3: can't open file '${args[0]}': [Errno 2] No such file or directory`);
        }
    }

    node(args) {
        if (args.length === 0 || args[0] === '--version') {
            this.writeLine('v20.10.0');
        } else if (args[0] === '-e') {
            this.writeLine('<span class="terminal-success">Code executed successfully</span>');
        } else {
            this.writeLine(`node: cannot open file '${args[0]}'`);
        }
    }

    gcc(args) {
        if (args.length === 0) {
            this.writeLine('gcc: fatal error: no input files');
        } else {
            this.writeLine(`<span class="terminal-success">Compilation successful: ${args[0]} -> a.out</span>`);
        }
    }

    man(command) {
        if (!command) {
            this.writeLine('What manual page do you want?');
            return;
        }

        const manPages = {
            'ls': 'LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs (the current directory by default).',
            'cat': 'CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [OPTION]... [FILE]...',
            'ping': 'PING(8)\n\nNAME\n       ping - send ICMP ECHO_REQUEST to network hosts\n\nSYNOPSIS\n       ping [options] destination',
            'nmap': 'NMAP(1)\n\nNAME\n       nmap - Network exploration tool and security / port scanner\n\nSYNOPSIS\n       nmap [Scan Type...] [Options] {target specification}'
        };

        if (manPages[command]) {
            this.writeLine(manPages[command]);
        } else {
            this.writeLine(`No manual entry for ${command}`);
        }
    }

    showHistory() {
        this.history.forEach((cmd, i) => {
            this.writeLine(`${(i + 1).toString().padStart(5)} ${cmd}`);
        });
    }

    autoComplete() {
        const commands = ['help', 'clear', 'ls', 'pwd', 'cat', 'echo', 'whoami', 'date', 'ping', 'nmap'];
        const input = this.input.value;
        const matches = commands.filter(cmd => cmd.startsWith(input));
        if (matches.length === 1) {
            this.input.value = matches[0];
        }
    }

    writeLine(text) {
        const line = document.createElement('div');
        line.innerHTML = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    const terminalContainers = document.querySelectorAll('[data-terminal]');
    terminalContainers.forEach(container => {
        if (container.id) {
            new Terminal(container.id);
        } else {
            new Terminal(container);
        }
    });
});
