# 🔐 SSH KEY SETUP GUIDE
## Generate SSH Key untuk VPS Hostinger

### 📋 Windows (PowerShell/CMD):
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "alimam.sukabumi@gmail.com"

# Follow prompts:
# - Save as: C:\Users\[username]\.ssh\id_rsa
# - Passphrase: Al ImamSSH2026! (optional but recommended)
```

### 📋 Copy Public Key:
```bash
# Display public key
cat C:\Users\[username]\.ssh\id_rsa.pub

# Copy the output (starts with ssh-rsa)
```

### 📋 Add to Hostinger:
1. **Paste public key** di SSH key field
2. **Give it a name**: "Al Imam Laptop"
3. **Save SSH key**
4. **Keep private key safe** - jangan dibagikan

---

## 🎯 ALTERNATIVE: PASSWORD ONLY

### 📋 Jika Tidak Mau SSH Key:
1. **Leave SSH key field empty**
2. **Use root password only**
3. **Less secure** - tapi masih workable
4. **Can add SSH key later** - via VPS console

---

## 🔐 SECURITY RECOMMENDATIONS:

### ✅ Best Practice:
- 🛡️ **SSH Key + Password** - dual authentication
- 🔑 **Strong password** - 12+ characters
- 📱 **Store securely** - password manager
- 🔄 **Regular updates** - change password periodically

### ⚠️ Important:
- 🔐 **Never share** SSH private key
- 📧 **Backup SSH keys** - safe location
- 🚫 **Don't use simple passwords** - like "123456"
- 🛡️ **Enable firewall** - after VPS setup

---

## 🎯 NEXT STEPS:

### 📋 After Setup:
1. **Complete Hostinger setup**
2. **Wait for VPS activation** (5-15 menit)
3. **Get VPS IP address** via email
4. **Test SSH connection**
5. **Start Coolify installation**

### 📋 SSH Test Command:
```bash
# Test connection
ssh root@[VPS_IP_ADDRESS]

# First time will add host to known_hosts
# Enter password or use SSH key
```
