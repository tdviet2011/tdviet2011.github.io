export const profile = {
  name: 'Thân Đức Việt',
  email: 'tdviet1210@gmail.com',
  github: 'https://github.com/tdviet2011',
  linkedin: 'https://www.linkedin.com/in/%C4%91%E1%BB%A9c-vi%E1%BB%87t-th%C3%A2n-11492a412/',
  school: 'HCM-UTE',
  graduation: '2028',
  gpa: '3.66',
  cv: 'cv/Than_Duc_Viet_CV.pdf',
  studentId: '24161457',
};

export const skills = [
  { number: '01', icon: 'chip', title: 'Digital Design', items: ['Verilog', 'SystemVerilog', 'FSM & datapaths', 'Combinational & sequential logic', 'IEEE 754 arithmetic', 'int8 MAC arrays', 'Fault & side-channel countermeasures'], vi: ['Verilog', 'SystemVerilog', 'FSM & datapath', 'Logic tổ hợp & tuần tự', 'Số học IEEE 754', 'Mảng MAC int8', 'Chống tấn công lỗi & kênh kề'] },
  { number: '02', icon: 'check', title: 'Verification', items: ['Self-checking testbenches', 'Bit-exact reference models (Python, MATLAB)', 'Fault-injection testbenches', 'Generated test vectors', 'Waveform debugging'], vi: ['Testbench tự kiểm tra', 'Mô hình tham chiếu bit-exact (Python, MATLAB)', 'Testbench tiêm lỗi', 'Sinh vector kiểm thử', 'Debug bằng waveform'] },
  { number: '03', icon: 'signal', title: 'Embedded & Analog', items: ['Designed, built and ran real circuit boards', 'Bench testing & debugging on hardware', 'ESP32 · PIC · Arduino', 'AI on embedded systems', 'UART · GPIO · PWM', 'LED, 7-segment & LCD interfacing', 'Analog design fundamentals'], vi: ['Thiết kế, làm mạch và chạy thực tế', 'Đo kiểm & debug trên phần cứng thật', 'ESP32 · PIC · Arduino', 'Tích hợp AI vào hệ thống nhúng', 'UART · GPIO · PWM', 'Giao tiếp LED, LED 7 đoạn & LCD', 'Kiến thức nền tảng thiết kế analog'] },
  { number: '04', icon: 'terminal', title: 'Tools', items: ['Xilinx Vivado', 'Icarus Verilog · Verilator', 'Yosys', 'MATLAB · Python', 'Git & GitHub', 'Cadence (analog schematic & simulation)', 'Proteus · Altium Designer'], vi: ['Xilinx Vivado', 'Icarus Verilog · Verilator', 'Yosys', 'MATLAB · Python', 'Git & GitHub', 'Cadence (schematic & mô phỏng analog)', 'Proteus · Altium Designer'] },
];

export const timeline = [
  { date: '2024', title: { en: 'The starting point', vi: 'Bắt đầu hành trình' }, body: { en: 'Started the Integrated Circuit Design program at HCM-UTE.', vi: 'Bắt đầu chương trình Thiết kế vi mạch tại HCM-UTE.' } },
  { date: { en: 'DURING MY STUDIES', vi: 'TRONG QUÁ TRÌNH HỌC' }, title: { en: 'Building the foundations', vi: 'Xây dựng nền tảng' }, body: { en: 'Digital logic, Verilog, circuit design and simulation through coursework and hands-on projects.', vi: 'Rèn luyện logic số, Verilog, thiết kế mạch và mô phỏng qua học phần và dự án thực hành.' } },
  { date: { en: 'NOW', vi: 'HIỆN TẠI' }, title: { en: 'Focused on RTL Design', vi: 'Tập trung vào RTL Design' }, body: { en: 'A fault-hardened AES-256 core, an IEEE 754 ALU, an int8 MNIST accelerator and QC-LDPC research. Seeking an RTL Design internship.', vi: 'Lõi AES-256 chống tấn công lỗi, ALU IEEE 754, bộ tăng tốc MNIST int8 và đề tài QC-LDPC. Tìm cơ hội thực tập RTL Design.' }, current: true },
  { date: '2028', title: { en: 'Expected graduation', vi: 'Dự kiến tốt nghiệp' }, body: { en: 'Complete the undergraduate program in Integrated Circuit Design.', vi: 'Hoàn thành chương trình đại học ngành Thiết kế vi mạch.' } },
];
