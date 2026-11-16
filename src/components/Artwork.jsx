import { useId } from 'react';

export function ChipArtwork() {
  const prefix = useId().replace(/:/g, '');
  return <svg className="chip-artwork" viewBox="0 0 500 430" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${prefix}-top`} x1="160" y1="120" x2="365" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="#313056"/><stop offset="1" stopColor="#101321"/></linearGradient>
      <linearGradient id={`${prefix}-side`} x1="100" y1="210" x2="380" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#6e50b3"/><stop offset="1" stopColor="#19172c"/></linearGradient>
      <radialGradient id={`${prefix}-glow`}><stop stopColor="#9875e8" stopOpacity=".24"/><stop offset="1" stopColor="#9875e8" stopOpacity="0"/></radialGradient>
      <pattern id={`${prefix}-grid`} width="28" height="16" patternUnits="userSpaceOnUse" patternTransform="matrix(1 .54 -1 .54 250 -20)"><path d="M28 0H0v16" stroke="#8b7bbb" strokeOpacity=".13"/></pattern>
    </defs>
    <ellipse cx="250" cy="245" rx="240" ry="180" fill={`url(#${prefix}-glow)`}/>
    <rect width="500" height="430" fill={`url(#${prefix}-grid)`}/>
    <g stroke="#494263" strokeWidth="1.2">
      <path d="m193 140-65-35H70l-25-15M168 154l-72-39H40m102 53L70 129H12m288 13 54-30h81l30-16m-138 60 53-29h78M181 272l-66 36H56l-25 14m171-38-66 36v42m179-85 69 37h56l28 15m-135-64 86 46v46"/>
      <path d="m219 126-44-24V60m65 55V42m24 86 47-26V69m-79 234v52m28-42v45l35 20h50"/>
      <circle cx="45" cy="90" r="3"/><circle cx="465" cy="96" r="3"/><circle cx="175" cy="60" r="3"/><circle cx="311" cy="69" r="3"/><circle cx="136" cy="362" r="3"/><circle cx="419" cy="357" r="3"/>
    </g>
    <path className="signal-trace" d="m12 169 58 31h46m251 52 63 34h58M240 42v73" stroke="#b29aef" strokeWidth="1.5"/>
    <g stroke="#8c78bc" strokeWidth="4" strokeLinecap="square">
      {Array.from({ length: 10 }, (_, i) => <g key={i}><path d={`M${123+i*12} ${193-i*6.5} l-17 -9`}/><path d={`M${264+i*12} ${138+i*6.5} l17 -9`}/><path d={`M${123+i*12} ${232+i*6.5} l-17 9`}/><path d={`M${264+i*12} ${287-i*6.5} l17 9`}/></g>)}
    </g>
    <path d="m110 199 140 76 140-76v27l-140 76-140-76Z" fill={`url(#${prefix}-side)`} stroke="#68508c"/>
    <path d="m110 199 140-76 140 76-140 76Z" fill={`url(#${prefix}-top)`} stroke="#b398ed" strokeWidth="1.4"/>
    <path d="m130 199 120-65 120 65-120 65Z" stroke="#8470ab" strokeOpacity=".5"/>
    <path d="m163 198 87-47 87 47-87 47Z" fill="#1c1e32" stroke="#78659b"/>
    <path d="m169 198 81-43 81 43-81 44Z" stroke="#a28cc7" strokeOpacity=".3"/>
    <g transform="matrix(.866 .47 -.866 .47 249 165)">
      <path d="M10 8h55v58H10z" fill="#2d2b49" stroke="#b599e7" strokeWidth=".9"/>
      <path d="M18 16h39v42H18zM18 24h12v25h18V33H38m19-9H38v-8M18 42h12m18 16V49h9" stroke="#a78bfa" strokeWidth="1.2"/>
      <rect x="27" y="26" width="16" height="14" fill="#a78bfa" fillOpacity=".18"/>
      <path d="M15 70h44M15 74h32" stroke="#a78bfa" strokeOpacity=".6"/>
    </g>
    <text x="251" y="233" textAnchor="middle" fill="#d2c0f4" fontFamily="monospace" fontSize="10" letterSpacing="2" transform="rotate(-28 251 233)">RTL DESIGN</text>
    <g fontFamily="monospace" fontSize="9" letterSpacing="1.4" fill="currentColor">
      <text x="39" y="74">CLK</text><text x="410" y="83">DATA_IN</text><text x="33" y="343">CONTROL</text><text x="399" y="379">DATA_OUT</text>
    </g>
    <g fill="#bca2f2"><circle cx="240" cy="42" r="3"/><circle cx="12" cy="169" r="3"/><circle cx="488" cy="286" r="3"/></g>
    <path d="M25 24h20m-20 0v20m450-20h-20m20 0v20M25 402h20m-20 0v-20m450 20h-20m20 0v-20" stroke="currentColor" opacity=".25"/>
  </svg>;
}

export function ProjectArtwork({ kind, className = '' }) {
  return <div className={`project-art art-${kind} ${className}`} aria-hidden="true">
    <svg viewBox="0 0 560 300" fill="none">
      <defs><pattern id={`dots-${kind}`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".23"/></pattern></defs>
      <rect width="560" height="300" fill={`url(#dots-${kind})`}/>
      {kind === 'aes' ? <>
        <g stroke="currentColor" strokeOpacity=".45"><path d="M40 115h90l40 40h40M520 115h-90l-40 40h-40M40 205h90l40-40h40M520 205h-90l-40-40h-40M280 25v65m0 145v40"/>
          {Array.from({ length: 6 }, (_, i) => <g key={i}><path d={`M${226+i*22} 81v16m0 126v16M193 ${105+i*22}h16m142 0h16`}/></g>)}
        </g>
        <rect x="208" y="97" width="144" height="126" rx="12" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".75"/>
        <rect x="218" y="107" width="124" height="106" rx="7" stroke="currentColor" strokeOpacity=".2"/>
        <path d="M267 150v-10a13 13 0 0 1 26 0v10m-30 0h34v27h-34z" stroke="currentColor" strokeWidth="2"/><circle cx="280" cy="162" r="2" fill="currentColor"/>
        <text x="280" y="198" textAnchor="middle">AES-256</text>
        <text x="54" y="103" className="art-small">PLAINTEXT</text><text x="432" y="103" className="art-small">CIPHERTEXT</text>
        <rect x="70" y="138" width="74" height="38" rx="6" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".3"/><text x="107" y="162" textAnchor="middle" className="art-small">128 BIT</text>
        <rect x="416" y="138" width="74" height="38" rx="6" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".3"/><text x="453" y="162" textAnchor="middle" className="art-small">ENC/DEC</text>
        <text x="294" y="53" className="art-small">256-BIT KEY</text>
      </> : kind === 'alu' ? <>
        <g stroke="currentColor" strokeOpacity=".4"><path d="M55 100h80l55 55h60M55 210h80l55-55M348 155h110l35-35M280 38v47m0 140v36"/></g>
        <path d="m221 85 49 24 49-24v68l-49 72-49-72Z" fill="var(--art-surface)" stroke="currentColor"/>
        <text x="270" y="159" textAnchor="middle" fontSize="22">ALU</text>
        <text x="56" y="82" className="art-small">OPERAND A</text><text x="56" y="236" className="art-small">OPERAND B</text><text x="408" y="108" className="art-small">FLOAT32</text>
        <g transform="translate(374 178)">{['S', 'EXP', 'MANTISSA'].map((label, i) => <g key={label} transform={`translate(${[0,25,75][i]} 0)`}><rect width={[20,45,90][i]} height="26" rx="3" fill="currentColor" fillOpacity={.1+i*.035} stroke="currentColor" strokeOpacity=".4"/><text x={[10,22.5,45][i]} y="17" textAnchor="middle" className="art-small">{label}</text></g>)}</g>
        <text x="293" y="55" className="art-small">OPCODE</text>
      </> : kind === 'ldpc' ? <>
        {(() => {
          const vx = Array.from({ length: 12 }, (_, i) => 60 + i * 40);
          const cx = Array.from({ length: 6 }, (_, i) => 90 + i * 76);
          const conn = [[0,2,5,9],[1,3,6,10],[0,4,7,11],[2,5,8,10],[1,6,9,11],[3,4,7,8]];
          return <>
            <g stroke="currentColor" strokeOpacity=".25">{conn.map((vs, c) => vs.map(v => <path key={`${c}-${v}`} d={`M${vx[v]} 96 L${cx[c]} 196`}/>))}</g>
            <g stroke="currentColor" strokeWidth="1.6">{[[0,0],[2,0],[1,3]].map(([c,k]) => <path key={`h${c}`} d={`M${vx[conn[c][k]]} 96 L${cx[c]} 196`}/>)}</g>
            {vx.map((x, i) => <circle key={i} cx={x} cy="86" r="10" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".85"/>)}
            {cx.map((x, i) => <rect key={i} x={x - 11} y="196" width="22" height="22" rx="2" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".85"/>)}
          </>;
        })()}
        <text x="50" y="55" className="art-small">VARIABLE NODES · N = 10,240</text>
        <text x="79" y="247" className="art-small">CHECK NODES · LAYERED OFFSET MIN-SUM</text>
        <g transform="translate(370 226)"><rect width="150" height="34" rx="6" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".4"/><text x="75" y="21" textAnchor="middle" className="art-small">3 FIXES · −18.8% CARRY4</text></g>
      </> : <>
        <g stroke="currentColor" strokeOpacity=".22">{Array.from({ length: 5 }, (_, i) => Array.from({ length: 4 }, (_, j) => <path key={`${i}-${j}`} d={`M222 ${65+i*40} 340 ${85+j*43}`}/>))}{Array.from({ length: 4 }, (_, i) => Array.from({ length: 3 }, (_, j) => <path key={`r${i}-${j}`} d={`M340 ${85+i*43} 442 ${110+j*48}`}/>))}</g>
        <rect x="46" y="108" width="88" height="88" rx="6" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".35"/>
        {['0011100','0110110','0000110','0001100','0011000','0110000','0111110'].map((row,y)=>row.split('').map((bit,x)=>bit==='1'?<rect key={`${x}-${y}`} x={58+x*9} y={120+y*9} width="7" height="7" fill="currentColor" opacity=".8"/>:null))}
        <path d="M134 151h64" stroke="currentColor" strokeOpacity=".45"/>
        {[{x:222,n:5,start:65,gap:40},{x:340,n:4,start:85,gap:43},{x:442,n:3,start:110,gap:48}].map(layer=>Array.from({length:layer.n},(_,i)=><circle key={`${layer.x}-${i}`} cx={layer.x} cy={layer.start+i*layer.gap} r="11" fill="var(--art-surface)" stroke="currentColor" strokeOpacity=".8"/>))}
        <text x="88" y="225" textAnchor="middle" className="art-small">28 × 28</text><text x="222" y="269" textAnchor="middle">784</text><text x="340" y="269" textAnchor="middle">32</text><text x="442" y="269" textAnchor="middle">10</text>
      </>}
    </svg>
  </div>;
}
