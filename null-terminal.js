// Null Terminal - NullSector Modified Kali Linux Terminal Emulator
// Security: All operations are sandboxed and local - no external network connections

class NullTerminal {
    constructor() {
        this.currentPath = '~';
        this.username = 'kali';
        this.hostname = 'nullsector';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.fileSystem = this.initFileSystem();
        this.environment = {
            'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            'HOME': '/home/kali',
            'USER': 'kali',
            'SHELL': '/bin/bash',
            'TERM': 'xterm-256color',
            'LANG': 'en_US.UTF-8'
        };
        this.processQueue = [];
        this.startTime = new Date();
        this.init();
    }

    initFileSystem() {
        return {
            '~': {
                type: 'dir',
                contents: {
                    'Desktop': { type: 'dir', contents: {} },
                    'Documents': { type: 'dir', contents: {
                        'notes.txt': { type: 'file', content: 'NullSector Terminal - Practice safely!' },
                        'exploit.py': { type: 'file', content: '#!/usr/bin/env python3\n# Example exploit script\nprint("Educational purposes only!")' }
                    }},
                    'Downloads': { type: 'dir', contents: {} },
                    'Pictures': { type: 'dir', contents: {} },
                    'tools': { type: 'dir', contents: {
                        'recon': { type: 'dir', contents: {} },
                        'exploitation': { type: 'dir', contents: {} },
                        'post-exploitation': { type: 'dir', contents: {} }
                    }},
                    '.bashrc': { type: 'file', content: '# NullSector Terminal Configuration' },
                    '.profile': { type: 'file', content: '# User profile configuration' },
                    'README.md': { type: 'file', content: '# Welcome to Null Terminal\nA secure learning environment by NullSector' }
                }
            }
        };
    }

    init() {
        this.outputElement = document.getElementById('terminal-output') || document.querySelector('.terminal-body');
        // Fallback: If the terminal output element is not present for any reason,
        // attempt to recover by setting a stable reference or creating the element.
        if (!this.outputElement) {
            console.warn('[NullTerminal] terminal-output element not found; attempting to create fallback.');
            const terminalWindow = document.querySelector('.terminal-window');
            if (terminalWindow) {
                const wrapper = document.createElement('div');
                wrapper.className = 'terminal-body';
                wrapper.id = 'terminal-output';
                wrapper.textContent = 'Initializing Null Terminal...';
                terminalWindow.appendChild(wrapper);
                this.outputElement = wrapper;
            } else {
                // Last resort: append to body
                const wrapper = document.createElement('div');
                wrapper.className = 'terminal-body';
                wrapper.id = 'terminal-output';
                wrapper.textContent = 'Initializing Null Terminal...';
                document.body.appendChild(wrapper);
                this.outputElement = wrapper;
            }
        }
        this.showWelcomeBanner();
        this.createInputLine();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Load command history from localStorage
        const savedHistory = localStorage.getItem('nullTerminalHistory');
        if (savedHistory) {
            this.commandHistory = JSON.parse(savedHistory);
        }
    }

    updateTime() {
        const now = new Date();
        const elapsed = Math.floor((now - this.startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        const timeElement = document.getElementById('terminal-time');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    showWelcomeBanner() {
        const banner = `
<span class="ascii-art">
   _   _       _ _  _____                   _             _ 
  | \\ | |     | | |/ ____|                 | |           | |
  |  \\| |_   _| | | (___   ___  ___  __ _ | |_ ___  _ __| |
  | . \` | | | | | |\\___ \\ / _ \\/ __|/ _\` || __/ _ \\| '__| |
  | |\\  | |_| | | |____) |  __/ (__| (_| || || (_) | |  |_|
  |_| \\_|\\__,_|_|_|_____/ \\___|\\___|\\__,_| \\__\\___/|_|  (_)
  
  ⚡ Null Terminal v1.0 - Modified Kali Linux Environment
  🛡️  Secure Sandbox | 🎓 Educational Use Only | 💚 By NullSector
</span>

<span class="output-info">Welcome to Null Terminal - A NullSector Project</span>
<span class="output-muted">════════════════════════════════════════════════════════════</span>

<span class="output-success">✓ System initialized successfully</span>
<span class="output-success">✓ Secure sandbox environment active</span>
<span class="output-success">✓ All commands are local and safe</span>

<span class="output-warning">Type 'help' for available commands or 'banner' to see this again</span>
<span class="output-muted">════════════════════════════════════════════════════════════</span>
`;
        this.addOutput(banner);
    }

    createInputLine() {
        const promptLine = document.createElement('div');
        promptLine.className = 'terminal-prompt';
        promptLine.innerHTML = `
            <span class="prompt-user">${this.username}</span><span class="prompt-at">@</span><span class="prompt-host">${this.hostname}</span>:<span class="prompt-path">${this.currentPath}</span><span class="prompt-symbol">$</span>
            <div class="terminal-input-wrapper">
                <input type="text" class="terminal-input" id="terminal-input" autofocus autocomplete="off" spellcheck="false">
            </div>
        `;
        this.outputElement.appendChild(promptLine);
        
        const input = document.getElementById('terminal-input');
        input.focus();
        
        input.addEventListener('keydown', (e) => this.handleInput(e));
        input.addEventListener('blur', () => {
            setTimeout(() => input.focus(), 100);
        });
    }

    handleInput(e) {
        const input = e.target;
        
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                this.commandHistory.push(command);
                localStorage.setItem('nullTerminalHistory', JSON.stringify(this.commandHistory.slice(-100)));
                this.historyIndex = this.commandHistory.length;
                this.executeCommand(command);
            } else {
                this.createInputLine();
            }
            input.disabled = true;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autoComplete(input);
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            this.clearTerminal();
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            this.addOutput('<span class="output-warning">^C</span>');
            this.createInputLine();
            input.disabled = true;
        }
    }

    autoComplete(input) {
        const value = input.value;
        const commands = Object.keys(this.commands);
        const matches = commands.filter(cmd => cmd.startsWith(value));
        
        if (matches.length === 1) {
            input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            this.addOutput(`\n<span class="output-info">${matches.join('  ')}</span>`);
            this.createInputLine();
            input.disabled = true;
        }
    }

    executeCommand(command) {
        const parts = command.split(' ').filter(p => p);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        if (this.commands[cmd]) {
            const output = this.commands[cmd].call(this, args);
            if (output) {
                this.addOutput(output);
            }
        } else {
            this.addOutput(`<span class="output-error">bash: ${cmd}: command not found</span>\n<span class="output-muted">Type 'help' to see available commands</span>`);
        }
        
        this.createInputLine();
        this.scrollToBottom();
    }

    addOutput(text) {
        const output = document.createElement('div');
        output.className = 'terminal-output';
        output.innerHTML = text;
        this.outputElement.appendChild(output);
    }

    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    clearTerminal() {
        this.outputElement.innerHTML = '';
    }

    // Command implementations
    commands = {
        // System Information Commands
        'help': function() {
            return `<span class="output-success">Available Commands - Kali Linux Terminal Emulator</span>
<span class="output-muted">══════════════════════════════════════════════════════════</span>

<span class="output-highlight">📁 File System Commands:</span>
  ls, ll, dir          - List directory contents
  cd [dir]             - Change directory
  pwd                  - Print working directory
  mkdir [name]         - Create directory
  touch [file]         - Create empty file
  rm [file]            - Remove file/directory
  cat [file]           - Display file contents
  nano [file]          - Edit file (simulated)
  cp [src] [dest]      - Copy files
  mv [src] [dest]      - Move/rename files
  find [pattern]       - Search for files
  tree                 - Display directory tree

<span class="output-highlight">ℹ️  System Information:</span>
  uname, whoami        - System/user info
  hostname             - Show hostname
  uptime               - System uptime
  date                 - Current date/time
  w, who               - Show logged users
  ps, top, htop        - Process information
  df, du               - Disk usage
  free                 - Memory information
  lscpu, lsblk         - Hardware info

<span class="output-highlight">🌐 Network Commands:</span>
  ifconfig, ip         - Network configuration
  ping [host]          - Ping host
  netstat              - Network statistics
  nmap [target]        - Network scanner
  traceroute [host]    - Trace route
  dig, nslookup [host] - DNS lookup
  wget, curl [url]     - Download files
  ssh [user@host]      - SSH connection (simulated)
  nc, netcat           - Network utility

<span class="output-highlight">🔒 Security & Hacking Tools:</span>
  nmap                 - Network mapper
  metasploit, msfconsole - Metasploit framework
  aircrack-ng          - WiFi security
  john                 - Password cracker
  hydra                - Brute force tool
  sqlmap               - SQL injection tool
  burpsuite            - Web security testing
  wireshark, tcpdump   - Packet analysis
  nikto                - Web scanner
  gobuster, dirb       - Directory brute force
  wpscan               - WordPress scanner
  searchsploit         - Exploit database
  hashcat              - Password recovery

<span class="output-highlight">🐍 Programming & Scripting:</span>
  python, python3      - Python interpreter
  gcc, g++             - C/C++ compiler
  java, javac          - Java tools
  ruby, perl, php      - Script interpreters
  node, npm            - Node.js tools
  git                  - Version control

<span class="output-highlight">📦 Package Management:</span>
  apt, apt-get         - Package manager
  dpkg                 - Debian package manager
  pip, pip3            - Python packages

<span class="output-highlight">🛠️  Utilities:</span>
  clear                - Clear screen
  history              - Command history
  echo [text]          - Print text
  grep [pattern]       - Search text
  sed, awk             - Text processing
  chmod, chown         - Change permissions
  tar, gzip, zip       - Archive tools
  man [command]        - Manual pages
  alias                - Command aliases

<span class="output-highlight">🎨 NullSector Specials:</span>
  banner               - Show NullSector banner
  neofetch             - System info with art
  cowsay [text]        - ASCII cow says text
  cmatrix              - Matrix effect
  sl                   - Steam locomotive
  fortune              - Random quote

<span class="output-muted">══════════════════════════════════════════════════════════</span>
<span class="output-info">💡 Tip: Use Tab for auto-completion, ↑↓ for history</span>`;
        },

        'banner': function() {
            this.showWelcomeBanner();
            return '';
        },

        'clear': function() {
            this.clearTerminal();
            return '';
        },

        'cls': function() {
            return this.commands.clear.call(this);
        },

        // File System Commands
        'ls': function(args) {
            const showAll = args.includes('-a') || args.includes('-la');
            const longFormat = args.includes('-l') || args.includes('-la');
            
            const current = this.resolvePath(this.currentPath);
            if (!current || current.type !== 'dir') {
                return '<span class="output-error">ls: cannot access: Not a directory</span>';
            }
            
            let items = Object.keys(current.contents);
            if (!showAll) {
                items = items.filter(item => !item.startsWith('.'));
            }
            
            if (longFormat) {
                let output = '<span class="output-muted">total ' + items.length + '</span>\n';
                items.forEach(item => {
                    const entry = current.contents[item];
                    const isDir = entry.type === 'dir';
                    const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                    const size = isDir ? '4096' : (entry.content?.length || '0');
                    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const color = isDir ? 'file-dir' : 'file-regular';
                    output += `<span class="output-muted">${perms}  kali kali ${String(size).padStart(5)} ${date}</span> <span class="${color}">${item}</span>\n`;
                });
                return output;
            }
            
            let output = '<div class="file-listing">';
            items.forEach(item => {
                const entry = current.contents[item];
                const className = entry.type === 'dir' ? 'file-dir' : 'file-regular';
                output += `<div class="file-item"><span class="${className}">${item}</span></div>`;
            });
            output += '</div>';
            return output;
        },

        'll': function(args) {
            return this.commands.ls.call(this, ['-la', ...args]);
        },

        'dir': function(args) {
            return this.commands.ls.call(this, args);
        },

        'pwd': function() {
            const fullPath = this.currentPath === '~' ? '/home/kali' : this.currentPath;
            return `<span class="output-info">${fullPath}</span>`;
        },

        'cd': function(args) {
            if (!args.length || args[0] === '~') {
                this.currentPath = '~';
                return '';
            }
            
            const target = args[0];
            if (target === '..') {
                if (this.currentPath !== '~') {
                    const parts = this.currentPath.split('/').filter(p => p);
                    parts.pop();
                    this.currentPath = parts.length ? parts.join('/') : '~';
                }
                return '';
            }
            
            const newPath = this.currentPath === '~' ? target : `${this.currentPath}/${target}`;
            const resolved = this.resolvePath(newPath);
            
            if (!resolved) {
                return `<span class="output-error">cd: ${target}: No such file or directory</span>`;
            }
            if (resolved.type !== 'dir') {
                return `<span class="output-error">cd: ${target}: Not a directory</span>`;
            }
            
            this.currentPath = newPath;
            return '';
        },

        'mkdir': function(args) {
            if (!args.length) {
                return '<span class="output-error">mkdir: missing operand</span>';
            }
            
            const current = this.resolvePath(this.currentPath);
            if (!current || current.type !== 'dir') {
                return '<span class="output-error">mkdir: cannot create directory</span>';
            }
            
            const dirName = args[0];
            if (current.contents[dirName]) {
                return `<span class="output-error">mkdir: cannot create directory '${dirName}': File exists</span>`;
            }
            
            current.contents[dirName] = { type: 'dir', contents: {} };
            return `<span class="output-success">✓ Directory '${dirName}' created</span>`;
        },

        'touch': function(args) {
            if (!args.length) {
                return '<span class="output-error">touch: missing file operand</span>';
            }
            
            const current = this.resolvePath(this.currentPath);
            if (!current || current.type !== 'dir') {
                return '<span class="output-error">touch: cannot create file</span>';
            }
            
            const fileName = args[0];
            if (!current.contents[fileName]) {
                current.contents[fileName] = { type: 'file', content: '' };
            }
            return `<span class="output-success">✓ File '${fileName}' created</span>`;
        },

        'cat': function(args) {
            if (!args.length) {
                return '<span class="output-error">cat: missing file operand</span>';
            }
            
            const current = this.resolvePath(this.currentPath);
            const file = current?.contents?.[args[0]];
            
            if (!file) {
                return `<span class="output-error">cat: ${args[0]}: No such file or directory</span>`;
            }
            if (file.type === 'dir') {
                return `<span class="output-error">cat: ${args[0]}: Is a directory</span>`;
            }
            
            return `<span class="output-info">${file.content || '(empty file)'}</span>`;
        },

        'rm': function(args) {
            if (!args.length) {
                return '<span class="output-error">rm: missing operand</span>';
            }
            
            const current = this.resolvePath(this.currentPath);
            const target = args[0];
            
            if (!current?.contents?.[target]) {
                return `<span class="output-error">rm: cannot remove '${target}': No such file or directory</span>`;
            }
            
            delete current.contents[target];
            return `<span class="output-success">✓ '${target}' removed</span>`;
        },

        'tree': function() {
            const buildTree = (obj, prefix = '', isLast = true) => {
                let result = '';
                const entries = Object.entries(obj.contents || {});
                entries.forEach(([name, entry], index) => {
                    const isLastEntry = index === entries.length - 1;
                    const connector = isLastEntry ? '└── ' : '├── ';
                    const color = entry.type === 'dir' ? 'file-dir' : 'file-regular';
                    result += `${prefix}${connector}<span class="${color}">${name}</span>\n`;
                    
                    if (entry.type === 'dir') {
                        const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
                        result += buildTree(entry, newPrefix, isLastEntry);
                    }
                });
                return result;
            };
            
            const current = this.resolvePath(this.currentPath);
            if (!current || current.type !== 'dir') {
                return '<span class="output-error">tree: Not a directory</span>';
            }
            
            return `<span class="output-info">${this.currentPath}</span>\n` + buildTree(current);
        },

        // System Information
        'whoami': function() {
            return `<span class="output-success">${this.username}</span>`;
        },

        'hostname': function() {
            return `<span class="output-success">${this.hostname}</span>`;
        },

        'uname': function(args) {
            if (args.includes('-a')) {
                return `<span class="output-info">Linux ${this.hostname} 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.1.27-1kali1 (2023-05-12) x86_64 GNU/Linux</span>`;
            }
            return '<span class="output-info">Linux</span>';
        },

        'date': function() {
            const now = new Date();
            return `<span class="output-info">${now.toString()}</span>`;
        },

        'uptime': function() {
            const now = new Date();
            const elapsed = Math.floor((now - this.startTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            return `<span class="output-info">up ${hours} hours, ${minutes} minutes</span>`;
        },

        'w': function() {
            return `<span class="output-info">USER     TTY      FROM             LOGIN@   IDLE   WHAT</span>
<span class="output-success">kali     pts/0    null-terminal    ${new Date().toLocaleTimeString()}  0.00s  null-terminal</span>`;
        },

        'who': function() {
            return `<span class="output-success">kali     pts/0        ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>`;
        },

        'ps': function() {
            return `<span class="output-muted">  PID TTY          TIME CMD</span>
<span class="output-info"> 1337 pts/0    00:00:00 bash</span>
<span class="output-info"> 1338 pts/0    00:00:00 null-terminal</span>
<span class="output-info"> 1339 pts/0    00:00:00 ps</span>`;
        },

        'top': function() {
            return `<span class="output-success">Null Terminal - System Monitor</span>
<span class="output-muted">════════════════════════════════════════</span>
<span class="output-info">Tasks: 156 total,   1 running, 155 sleeping</span>
<span class="output-info">%Cpu(s):  2.3 us,  0.7 sy,  0.0 ni, 96.8 id</span>
<span class="output-info">MiB Mem :  16384.0 total,   8192.0 free</span>
<span class="output-muted">════════════════════════════════════════</span>
<span class="output-muted">  PID USER      PR  NI    VIRT    RES  %CPU %MEM</span>
<span class="output-info"> 1337 kali      20   0  234532  45612   1.3  0.3</span>
<span class="output-info"> 1338 kali      20   0  189244  32156   0.7  0.2</span>`;
        },

        'htop': function() {
            return this.commands.top.call(this);
        },

        'free': function() {
            return `<span class="output-muted">              total        used        free      shared  buff/cache   available</span>
<span class="output-info">Mem:       16777216     4194304    10485760      524288     2097152    11534336</span>
<span class="output-info">Swap:       2097152           0     2097152</span>`;
        },

        'df': function() {
            return `<span class="output-muted">Filesystem     1K-blocks      Used Available Use% Mounted on</span>
<span class="output-info">/dev/sda1      102400000  41943040  60456960  41% /</span>
<span class="output-info">tmpfs            8388608         0   8388608   0% /dev/shm</span>`;
        },

        'lscpu': function() {
            return `<span class="output-info">Architecture:            x86_64</span>
<span class="output-info">CPU op-mode(s):          32-bit, 64-bit</span>
<span class="output-info">CPU(s):                  8</span>
<span class="output-info">Model name:              Intel Core i7-9700K</span>
<span class="output-info">CPU MHz:                 3600.000</span>`;
        },

        // Network Commands
        'ifconfig': function() {
            return `<span class="output-success">eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;</span>
<span class="output-info">        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255</span>
<span class="output-info">        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64</span>
<span class="output-info">        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)</span>

<span class="output-success">lo: flags=73&lt;UP,LOOPBACK,RUNNING&gt;</span>
<span class="output-info">        inet 127.0.0.1  netmask 255.0.0.0</span>`;
        },

        'ip': function(args) {
            if (args[0] === 'addr' || args[0] === 'a') {
                return this.commands.ifconfig.call(this);
            }
            return `<span class="output-info">Usage: ip [ addr | route | link ]</span>`;
        },

        'ping': function(args) {
            if (!args.length) {
                return '<span class="output-error">ping: usage: ping [host]</span>';
            }
            const host = args[0];
            return `<span class="output-info">PING ${host} (93.184.216.34) 56(84) bytes of data.</span>
<span class="output-success">64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.123 ms</span>
<span class="output-success">64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.118 ms</span>
<span class="output-success">64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.125 ms</span>
<span class="output-muted">--- ${host} ping statistics ---</span>
<span class="output-info">3 packets transmitted, 3 received, 0% packet loss</span>`;
        },

        'netstat': function() {
            return `<span class="output-muted">Active Internet connections</span>
<span class="output-muted">Proto Recv-Q Send-Q Local Address           Foreign Address         State</span>
<span class="output-info">tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN</span>
<span class="output-info">tcp        0      0 192.168.1.100:443       93.184.216.34:48572     ESTABLISHED</span>`;
        },

        'nmap': function(args) {
            if (!args.length) {
                return `<span class="output-info">Nmap 7.94 ( https://nmap.org )</span>
<span class="output-warning">Usage: nmap [target]</span>
<span class="output-muted">Example: nmap 192.168.1.1</span>`;
            }
            
            const target = args[0];
            return `<span class="output-info">Starting Nmap scan on ${target}</span>
<span class="output-muted">═══════════════════════════════════════</span>
<span class="output-success">Nmap scan report for ${target}</span>
<span class="output-info">Host is up (0.00050s latency)</span>

<span class="output-muted">PORT     STATE SERVICE</span>
<span class="output-success">22/tcp   open  ssh</span>
<span class="output-success">80/tcp   open  http</span>
<span class="output-success">443/tcp  open  https</span>
<span class="output-info">3306/tcp closed mysql</span>

<span class="output-success">Nmap done: 1 IP address scanned in 2.84 seconds</span>`;
        },

        'traceroute': function(args) {
            if (!args.length) {
                return '<span class="output-error">traceroute: usage: traceroute [host]</span>';
            }
            const host = args[0];
            return `<span class="output-info">traceroute to ${host}, 30 hops max</span>
<span class="output-muted"> 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.456 ms</span>
<span class="output-muted"> 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.789 ms</span>
<span class="output-muted"> 3  ${host}  15.234 ms  15.123 ms  15.345 ms</span>`;
        },

        'dig': function(args) {
            if (!args.length) {
                return '<span class="output-error">dig: usage: dig [domain]</span>';
            }
            const domain = args[0];
            return `<span class="output-muted">; &lt;&lt;&gt;&gt; DiG 9.18.12 &lt;&lt;&gt;&gt; ${domain}</span>
<span class="output-info">;; ANSWER SECTION:</span>
<span class="output-success">${domain}.     300  IN  A   93.184.216.34</span>
<span class="output-info">;; Query time: 23 msec</span>`;
        },

        'nslookup': function(args) {
            if (!args.length) {
                return '<span class="output-error">nslookup: usage: nslookup [domain]</span>';
            }
            const domain = args[0];
            return `<span class="output-info">Server:  192.168.1.1</span>
<span class="output-info">Address: 192.168.1.1#53</span>

<span class="output-success">Name:    ${domain}</span>
<span class="output-success">Address: 93.184.216.34</span>`;
        },

        'wget': function(args) {
            if (!args.length) {
                return '<span class="output-error">wget: usage: wget [url]</span>';
            }
            return `<span class="output-info">--${new Date().toLocaleString()}--  ${args[0]}</span>
<span class="output-success">Connecting to ${args[0]}... connected.</span>
<span class="output-success">HTTP request sent, awaiting response... 200 OK</span>
<span class="output-info">Length: 12345 (12K) [text/html]</span>
<span class="output-success">Saving to: 'index.html'</span>
<span class="output-success">✓ Downloaded successfully (simulated)</span>`;
        },

        'curl': function(args) {
            if (!args.length) {
                return '<span class="output-error">curl: usage: curl [url]</span>';
            }
            return `<span class="output-info">Fetching ${args[0]}...</span>
<span class="output-success">HTTP/1.1 200 OK</span>
<span class="output-muted">Content-Type: text/html</span>
<span class="output-success">✓ Request successful (simulated)</span>`;
        },

        'ssh': function(args) {
            if (!args.length) {
                return '<span class="output-error">ssh: usage: ssh [user@]hostname</span>';
            }
            return `<span class="output-warning">🔒 Simulated SSH Connection</span>
<span class="output-info">Connecting to ${args[0]}...</span>
<span class="output-success">✓ Connection established (simulated)</span>
<span class="output-muted">This is a safe simulation - no actual network connection</span>`;
        },

        'nc': function() {
            return `<span class="output-info">Netcat (nc) 1.10</span>
<span class="output-muted">Usage: nc [-options] hostname port[s]</span>
<span class="output-warning">⚠️  Simulated environment - actual network connections disabled</span>`;
        },

        'netcat': function() {
            return this.commands.nc.call(this);
        },

        // Security Tools
        'metasploit': function() {
            return `<span class="output-success">
       =[ metasploit v6.3.16-dev                          ]
+ -- --=[ 2328 exploits - 1218 auxiliary - 413 post       ]
+ -- --=[ 1318 payloads - 46 encoders - 11 nops          ]
+ -- --=[ 9 evasion                                       ]
</span>
<span class="output-info">Metasploit tip: Use 'search' to find modules</span>
<span class="output-warning">⚠️  Educational simulation only</span>`;
        },

        'msfconsole': function() {
            return this.commands.metasploit.call(this);
        },

        'aircrack-ng': function() {
            return `<span class="output-info">Aircrack-ng 1.7</span>
<span class="output-success">WiFi Security Auditing Tool</span>
<span class="output-warning">⚠️  Educational purposes only</span>
<span class="output-muted">Usage: aircrack-ng [options] &lt;capture file&gt;</span>`;
        },

        'john': function() {
            return `<span class="output-info">John the Ripper 1.9.0-jumbo-1</span>
<span class="output-success">Password Cracking Tool</span>
<span class="output-warning">⚠️  Ethical use only - Educational simulation</span>
<span class="output-muted">Usage: john [options] password-files</span>`;
        },

        'hydra': function() {
            return `<span class="output-info">Hydra v9.5 - Network Logon Cracker</span>
<span class="output-success">Fast password brute-forcing tool</span>
<span class="output-warning">⚠️  Use responsibly - Educational only</span>
<span class="output-muted">Usage: hydra [[[-l LOGIN|-L FILE] [-p PASS|-P FILE]] target service</span>`;
        },

        'sqlmap': function() {
            return `<span class="output-info">sqlmap/1.7.2#stable</span>
<span class="output-success">Automatic SQL Injection Tool</span>
<span class="output-warning">⚠️  Authorization required - Educational simulation</span>
<span class="output-muted">Usage: sqlmap [options]</span>`;
        },

        'burpsuite': function() {
            return `<span class="output-success">Burp Suite Professional</span>
<span class="output-info">Web Application Security Testing</span>
<span class="output-warning">⚠️  Simulated environment</span>
<span class="output-success">✓ Burp Suite would launch here (GUI application)</span>`;
        },

        'wireshark': function() {
            return `<span class="output-success">Wireshark 4.0.6</span>
<span class="output-info">Network Protocol Analyzer</span>
<span class="output-warning">⚠️  Packet capture simulated</span>
<span class="output-success">✓ Wireshark would launch here (GUI application)</span>`;
        },

        'tcpdump': function() {
            return `<span class="output-info">tcpdump: listening on eth0, link-type EN10MB</span>
<span class="output-muted">12:34:56.789012 IP 192.168.1.100.52814 > 93.184.216.34.443: Flags [P.], seq 1:100, ack 1, win 502, length 99</span>
<span class="output-success">✓ Packet capture simulation (educational)</span>`;
        },

        'nikto': function() {
            return `<span class="output-info">- Nikto v2.5.0</span>
<span class="output-success">Web Server Scanner</span>
<span class="output-warning">⚠️  Simulated scan - Educational only</span>
<span class="output-muted">Usage: nikto -h [target]</span>`;
        },

        'gobuster': function() {
            return `<span class="output-info">Gobuster v3.5</span>
<span class="output-success">Directory/File Brute Forcing Tool</span>
<span class="output-warning">⚠️  Authorization required</span>
<span class="output-muted">Usage: gobuster dir -u [url] -w [wordlist]</span>`;
        },

        'dirb': function() {
            return `<span class="output-info">DIRB v2.22</span>
<span class="output-success">Web Content Scanner</span>
<span class="output-warning">⚠️  Educational simulation</span>
<span class="output-muted">Usage: dirb [url] [wordlist]</span>`;
        },

        'wpscan': function() {
            return `<span class="output-info">WPScan v3.8.24</span>
<span class="output-success">WordPress Security Scanner</span>
<span class="output-warning">⚠️  Use responsibly - Educational only</span>
<span class="output-muted">Usage: wpscan --url [target]</span>`;
        },

        'searchsploit': function(args) {
            return `<span class="output-info">Exploit Database Search</span>
<span class="output-success">Search term: ${args.join(' ') || 'all'}</span>
<span class="output-muted">─────────────────────────────────────────────────────</span>
<span class="output-info">Example exploits found (simulated):</span>
<span class="output-muted">• Apache 2.4.49 - Path Traversal (CVE-2021-41773)</span>
<span class="output-muted">• Linux Kernel 5.8 - Local Privilege Escalation</span>
<span class="output-warning">⚠️  Educational database simulation</span>`;
        },

        'hashcat': function() {
            return `<span class="output-info">hashcat v6.2.6</span>
<span class="output-success">Advanced Password Recovery</span>
<span class="output-warning">⚠️  Ethical use only</span>
<span class="output-muted">Usage: hashcat [options] hashfile [mask|wordfiles]</span>`;
        },

        // Programming
        'python': function(args) {
            if (!args.length) {
                return `<span class="output-info">Python 3.11.2 (main, Mar 13 2023, 12:18:29)</span>
<span class="output-muted">Type "help", "copyright", "credits" for more information.</span>
<span class="output-success">>>> </span><span class="output-muted">Interactive mode not available in this simulation</span>`;
            }
            return `<span class="output-success">✓ Python script executed (simulated)</span>`;
        },

        'python3': function(args) {
            return this.commands.python.call(this, args);
        },

        'gcc': function() {
            return `<span class="output-info">gcc (Debian 12.2.0-14) 12.2.0</span>
<span class="output-muted">Usage: gcc [options] file...</span>`;
        },

        'g++': function() {
            return `<span class="output-info">g++ (Debian 12.2.0-14) 12.2.0</span>
<span class="output-muted">Usage: g++ [options] file...</span>`;
        },

        'java': function() {
            return `<span class="output-info">openjdk 17.0.6 2023-01-17</span>
<span class="output-muted">OpenJDK Runtime Environment</span>`;
        },

        'node': function() {
            return `<span class="output-info">v18.16.0</span>`;
        },

        'npm': function() {
            return `<span class="output-info">9.5.1</span>`;
        },

        'git': function(args) {
            if (!args.length) {
                return `<span class="output-info">git version 2.39.2</span>
<span class="output-muted">Usage: git [command] [options]</span>`;
            }
            return `<span class="output-success">✓ Git command executed (simulated)</span>`;
        },

        // Package Management
        'apt': function(args) {
            if (!args.length) {
                return `<span class="output-info">apt 2.6.0 (amd64)</span>
<span class="output-muted">Usage: apt [options] command</span>`;
            }
            return `<span class="output-info">Reading package lists... Done</span>
<span class="output-success">✓ Operation completed (simulated)</span>`;
        },

        'apt-get': function(args) {
            return this.commands.apt.call(this, args);
        },

        'dpkg': function() {
            return `<span class="output-info">Debian 'dpkg' package management program</span>
<span class="output-muted">Usage: dpkg [options] action</span>`;
        },

        'pip': function() {
            return `<span class="output-info">pip 23.0.1</span>
<span class="output-muted">Usage: pip [command] [options]</span>`;
        },

        'pip3': function() {
            return this.commands.pip.call(this);
        },

        // Utilities
        'echo': function(args) {
            return `<span class="output-info">${args.join(' ')}</span>`;
        },

        'history': function() {
            if (this.commandHistory.length === 0) {
                return '<span class="output-muted">No command history</span>';
            }
            let output = '';
            this.commandHistory.slice(-20).forEach((cmd, index) => {
                const num = this.commandHistory.length - 20 + index + 1;
                output += `<span class="output-muted">${String(num).padStart(4)}  </span><span class="output-info">${cmd}</span>\n`;
            });
            return output;
        },

        'grep': function(args) {
            if (args.length < 2) {
                return '<span class="output-error">grep: usage: grep [pattern] [file]</span>';
            }
            return `<span class="output-success">✓ Pattern search executed (simulated)</span>`;
        },

        'chmod': function(args) {
            if (args.length < 2) {
                return '<span class="output-error">chmod: usage: chmod [mode] [file]</span>';
            }
            return `<span class="output-success">✓ Permissions changed for ${args[1]}</span>`;
        },

        'chown': function(args) {
            if (args.length < 2) {
                return '<span class="output-error">chown: usage: chown [owner] [file]</span>';
            }
            return `<span class="output-success">✓ Ownership changed for ${args[1]}</span>`;
        },

        'tar': function(args) {
            if (!args.length) {
                return '<span class="output-error">tar: usage: tar [options] [archive]</span>';
            }
            return `<span class="output-success">✓ Archive operation completed</span>`;
        },

        'zip': function(args) {
            if (args.length < 2) {
                return '<span class="output-error">zip: usage: zip [archive] [files]</span>';
            }
            return `<span class="output-success">✓ Files compressed to ${args[0]}</span>`;
        },

        'gzip': function(args) {
            if (!args.length) {
                return '<span class="output-error">gzip: usage: gzip [files]</span>';
            }
            return `<span class="output-success">✓ File compressed</span>`;
        },

        'man': function(args) {
            if (!args.length) {
                return '<span class="output-error">man: usage: man [command]</span>';
            }
            const cmd = args[0];
            return `<span class="output-success">Manual page for ${cmd}</span>
<span class="output-muted">═══════════════════════════════════════</span>
<span class="output-info">NAME</span>
       ${cmd} - simulated manual page

<span class="output-info">SYNOPSIS</span>
       ${cmd} [options]

<span class="output-info">DESCRIPTION</span>
       This is a simulated man page in Null Terminal.
       For real documentation, consult online resources.

<span class="output-muted">Type 'help' for available commands</span>`;
        },

        'alias': function() {
            return `<span class="output-info">Defined aliases:</span>
<span class="output-muted">ll='ls -la'</span>
<span class="output-muted">la='ls -A'</span>
<span class="output-muted">cls='clear'</span>`;
        },

        // Fun commands
        'neofetch': function() {
            return `<span class="output-success">
       _,met$$$$$gg.           kali@nullsector
    ,g$$$$$$$$$$$$$$$P.        ─────────────────
  ,g$$P"     """Y$$.".         OS: Kali GNU/Linux
 ,$$P'              \`$$$.       Kernel: 6.1.0-kali9-amd64
',$$P       ,ggs.     \`$$b:     Uptime: ${Math.floor((new Date() - this.startTime) / 60000)} mins
\`d$$'     ,$P"'   .    $$$     Shell: null-terminal
 $$P      d$'     ,    $$P     Terminal: null-terminal
 $$:      $$.   -    ,d$$'     CPU: Simulated CPU
 $$;      Y$b._   _,d$P'       Memory: 4096M / 16384M
 Y$$.    \`."\`"Y$$$$P"'          
 \`$$b      "-.__               </span>
<span class="output-highlight">⚡ NullSector Modified Environment</span>`;
        },

        'cowsay': function(args) {
            const text = args.join(' ') || 'NullSector!';
            const border = '_'.repeat(text.length + 2);
            return `<span class="output-success">
 ${border}
< ${text} >
 ${'-'.repeat(text.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</span>`;
        },

        'cmatrix': function() {
            return `<span class="output-success">🔋 Matrix Mode Activated</span>
<span class="output-success" style="animation: blink 0.5s infinite;">
█▀▀▀█  █  █  █     █       █▀▀▀  █▀▀▀  █▀▀█ ▀▀█▀▀  █▀▀█  █▀▀█
█   █  █  █  █     █       ▀▀▀█▄ █▀▀▀  █     █  ▀  █  █  █▄▄▀
█▄▄▄█  ▀▄▄▀  ▀▄▄   ▀▄▄     ▄▄▄▀▀ ▀▄▄▄  ▀▄▄▀  ▀▄▄   ▀▄▄▀  ▀ ▀▀
</span>
<span class="output-info">Press Ctrl+C to exit (simulated)</span>`;
        },

        'sl': function() {
            return `<span class="output-success">
      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @
     (@@@)
 (    )
  (@@@@)
(    )
                      (@@@)
              ====        ________                ___________
          _D _|  |_______/        \\__I_I_____===__|_________|
           |(_)---  |   H\\________/ |   |        =|___ ___|
           /     |  |   H  |  |     |   |         ||_| |_||
          |      |  |   H  |__--------------------| [___] |
          | ________|___H__/__|_____/[][]~\\_______|       |
          |/ |   |-----------I_____I [][] []  D   |=======|
        __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|
         |/-=|___|=O=====O=====O=====O   |_____/~\\___/
          \\_/      \\__/  \\__/  \\__/  \\__/      \\_/
</span>`;
        },

        'fortune': function() {
            const fortunes = [
                "The best way to predict the future is to implement it. - NullSector",
                "Security is not a product, but a process. Keep learning!",
                "With great power comes great responsibility. Code ethically.",
                "Every expert was once a beginner. Keep practicing!",
                "The only way to do great work is to love what you do.",
                "Innovation distinguishes between a leader and a follower.",
                "Stay curious, stay hungry, stay ethical. - NullSector Motto"
            ];
            const random = fortunes[Math.floor(Math.random() * fortunes.length)];
            return `<span class="output-info">${random}</span>`;
        },

        // Additional utilities
        'env': function() {
            let output = '<span class="output-info">Environment Variables:</span>\n';
            for (const [key, value] of Object.entries(this.environment)) {
                output += `<span class="output-muted">${key}=</span><span class="output-success">${value}</span>\n`;
            }
            return output;
        },

        'export': function(args) {
            if (!args.length) {
                return this.commands.env.call(this);
            }
            const [key, value] = args.join(' ').split('=');
            if (key && value) {
                this.environment[key] = value;
                return `<span class="output-success">✓ ${key} exported</span>`;
            }
            return '<span class="output-error">export: usage: export VAR=value</span>';
        },

        'cp': function(args) {
            if (args.length < 2) {
                return '<span class="output-error">cp: usage: cp [source] [destination]</span>';
            }
            return `<span class="output-success">✓ ${args[0]} copied to ${args[1]}</span>`;
        },

        'mv': function(args) {
            if (args.length < 2) {
                return '<span class="output-error">mv: usage: mv [source] [destination]</span>';
            }
            return `<span class="output-success">✓ ${args[0]} moved to ${args[1]}</span>`;
        },

        'find': function(args) {
            return `<span class="output-info">Searching...</span>
<span class="output-success">./Documents/notes.txt</span>
<span class="output-success">./Documents/exploit.py</span>
<span class="output-muted">2 files found</span>`;
        },

        'nano': function(args) {
            if (!args.length) {
                return '<span class="output-error">nano: usage: nano [file]</span>';
            }
            return `<span class="output-info">GNU nano 7.2</span>
<span class="output-success">✓ Editing ${args[0]} (simulated)</span>
<span class="output-muted">In a real terminal, this would open the nano editor</span>`;
        },

        'vi': function(args) {
            return `<span class="output-info">VIM - Vi IMproved 9.0</span>
<span class="output-success">✓ Editing ${args[0] || 'file'} (simulated)</span>
<span class="output-muted">In a real terminal, this would open vim</span>`;
        },

        'vim': function(args) {
            return this.commands.vi.call(this, args);
        },

        'sed': function() {
            return `<span class="output-info">sed (GNU sed) 4.9</span>
<span class="output-muted">Usage: sed [OPTION]... {script} [input-file]...</span>`;
        },

        'awk': function() {
            return `<span class="output-info">GNU Awk 5.2.1</span>
<span class="output-muted">Usage: awk [options] 'program' file...</span>`;
        },

        'exit': function() {
            return '<span class="output-warning">To close terminal, click the red button or close this tab</span>';
        },

        'quit': function() {
            return this.commands.exit.call(this);
        },

        'reboot': function() {
            this.clearTerminal();
            this.showWelcomeBanner();
            this.createInputLine();
            return '';
        },

        'shutdown': function() {
            return '<span class="output-warning">shutdown: System shutdown simulated. Refresh page to restart.</span>';
        }
    };

    resolvePath(path) {
        if (path === '~' || path === '') {
            return this.fileSystem['~'];
        }
        
        const parts = path.split('/').filter(p => p && p !== '~');
        let current = this.fileSystem['~'];
        
        for (const part of parts) {
            if (!current || !current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current;
    }
}

// Window control functions
function closeTerminal() {
    if (confirm('Close Null Terminal?')) {
        window.close();
        if (!window.closed) {
            window.location.href = 'index.html';
        }
    }
}

function minimizeTerminal() {
    document.querySelector('.terminal-window').style.opacity = '0.3';
    setTimeout(() => {
        document.querySelector('.terminal-window').style.opacity = '1';
    }, 300);
}

function maximizeTerminal() {
    const terminal = document.querySelector('.terminal-body');
    if (terminal.style.maxHeight === 'none') {
        terminal.style.maxHeight = '600px';
    } else {
        terminal.style.maxHeight = 'none';
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.nullTerminal = new NullTerminal();
});

// Search functionality
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
    }
});