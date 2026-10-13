import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const manifest=JSON.parse(readFileSync('manifest.webmanifest','utf8'));
test('game has required interactive elements',()=>{for(const id of ['board','play','pause','shift','score','best','overlay','realm','charge'])assert.match(html,new RegExp('id="'+id+'"'));});
test('game supports keyboard and touch controls',()=>{assert.match(html,/pointerdown/);assert.match(html,/keydown/);});
test('game implements two realms and high scores',()=>{assert.match(html,/palette=\[/);assert.match(html,/localStorage\.setItem/);assert.match(html,/function shift\(/);});
test('PWA manifest has expected identity',()=>{assert.equal(manifest.short_name,'Serpent Shift');assert.equal(manifest.display,'standalone');});
