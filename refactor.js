const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/itpua/Dev/Work/al-andalus/template-demo/src/app';

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && name === 'page.tsx') {
            callback(filePath);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

function refactorFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Aesthetics (Platinum Standard)
    // Replace p-4 on main wrappers if possible, but safely we can replace max-w utilities
    const origContent = content;
    
    // max-width replacements
    content = content.replace(/max-w-7xl/g, 'max-w-[1200px]');
    content = content.replace(/max-w-screen-xl/g, 'max-w-[1200px]');
    content = content.replace(/max-w-6xl/g, 'max-w-[1200px]');
    
    // Padding replacements (heuristics)
    content = content.replace(/p-4/g, 'p-[24px_28px]');
    content = content.replace(/p-5/g, 'p-[24px_28px]');
    
    // Rounded corners
    content = content.replace(/rounded-lg/g, 'rounded-[24px]');
    content = content.replace(/rounded-xl/g, 'rounded-[24px]');
    content = content.replace(/rounded-2xl/g, 'rounded-[24px]');
    
    // Table styling
    content = content.replace(/px-4 py-2/g, 'p-[16px_20px]');
    content = content.replace(/px-6 py-3/g, 'p-[16px_20px]');
    
    // Zebra striping for tr
    if (content.includes('<tr') && !content.includes('even:bg-slate-50')) {
        content = content.replace(/<tr className="/g, '<tr className="even:bg-slate-50 ');
    }

    // 2. Harmonious Content Accents
    // Replace bg-primary-100/200/500 text-primary-x with diverse colors in badges
    // We'll replace bg-primary-100 text-primary-800 with something like bg-amber-100 text-amber-800
    // To add diversity, let's just use regex to randomly or pseudo-randomly pick colors?
    // Actually, we can use specific mappings if we find known words.
    if (content.match(/Status|status|Jenjang|jenjang/)) {
        // Just make some badges amber, rose, sky
        let c = 0;
        const colors = ['amber', 'rose', 'sky', 'purple'];
        content = content.replace(/bg-primary-100 text-primary-700/g, () => {
            const col = colors[c % colors.length];
            c++;
            return `bg-${col}-100 text-${col}-700`;
        });
        content = content.replace(/bg-primary-50 text-primary-600/g, () => {
            const col = colors[c % colors.length];
            c++;
            return `bg-${col}-50 text-${col}-600`;
        });
    }

    // Secondary buttons
    content = content.replace(/border-primary-200 text-primary-700 hover:bg-primary-50/g, 'outline outline-1 outline-slate-200 text-slate-600 hover:bg-slate-50');

    // Icons inside cards (slate/gray instead of primary)
    // Heuristic: <Icon className="text-primary-500" />
    content = content.replace(/text-primary-500(?=[^>]*\/>)/g, 'text-slate-500');

    // 3. Form Autosave
    if (content.includes('useForm') && content.includes('react-hook-form') && !content.includes('localStorage.getItem(')) {
        console.log('Injecting Autosave into', filePath);
        
        // Find where useForm is declared
        const useFormMatch = content.match(/const\s+\{\s*([^}]+)\s*\}\s*=\s*useForm(<[^>]+>)?\s*\(\s*\{([^}]*)\}\s*\)/);
        
        if (useFormMatch) {
            // Need to make sure `watch`, `reset` are imported/destructured
            let destructures = useFormMatch[1];
            if (!destructures.includes('watch')) destructures += ', watch';
            if (!destructures.includes('reset')) destructures += ', reset';
            
            const newUseForm = content.substring(useFormMatch.index, useFormMatch.index + useFormMatch[0].length)
                .replace(useFormMatch[1], destructures);
                
            content = content.replace(useFormMatch[0], newUseForm);
            
            // Inject useEffect after useForm
            const formName = path.basename(path.dirname(filePath)) + '_' + path.basename(filePath);
            const useEffectHook = `
  useEffect(() => {
    try {
      const draft = localStorage.getItem('draft_${formName}');
      if (draft) {
        reset(JSON.parse(draft));
      }
    } catch (e) {}
    
    const sub = watch((value) => {
      localStorage.setItem('draft_${formName}', JSON.stringify(value));
    });
    return () => sub.unsubscribe();
  }, [watch, reset]);
`;
            // Insert it right after the useForm statement
            content = content.replace(newUseForm, newUseForm + '\n' + useEffectHook);
            
            // Make sure useEffect is imported
            if (!content.includes('useEffect')) {
                if (content.includes('import {') && content.includes('} from "react"')) {
                    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["']react["']/, (match, p1) => {
                        return `import { ${p1}, useEffect } from "react"`;
                    });
                } else {
                    content = 'import { useEffect } from "react";\n' + content;
                }
            }

            // Clear draft on submit
            if (content.includes('onSubmit=')) {
                // Find submit handler function
                const onSubmitMatch = content.match(/onSubmit=\{([^}]+)\}/);
                if (onSubmitMatch) {
                    const handlerName = onSubmitMatch[1];
                    // Append localStorage.removeItem inside the handler
                    // This is tricky, a simple replace might be enough if it's an async function
                    const handlerRegex = new RegExp(`(const|async function|function)\\s+${handlerName}\\s*\\([^)]*\\)\\s*\\{`);
                    content = content.replace(handlerRegex, (match) => {
                        return match + `\n    localStorage.removeItem('draft_${formName}');`;
                    });
                }
            }
        }
    }

    if (content !== origContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

walkSync(dir, refactorFile);
console.log('Refactoring complete.');
