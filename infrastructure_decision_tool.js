// Infrastructure Decision Tool
// INFO 300 - Programming Assignment
//
// Two tools in one program:
//   Part A - Subnet Host Checker
//   Part B - Compute Environment Selector
//
// Run with:  node infrastructure_decision_tool.js
// Requires:  npm install readline-sync

const readlineSync = require('readline-sync');

const AWS_RESERVED_IPS = 5; // AWS reserves 5 addresses in every subnet
const MIN_CIDR = 16;
const MAX_CIDR = 30;

// ---------------------------------------------------------------------------
// Input helpers (every prompt re-asks until the answer is valid)
// ---------------------------------------------------------------------------

// Accepts "/24" or "24". Must be a whole number from /16 to /30.
function askCidr(label) {
  while (true) {
    const raw = readlineSync.question(`${label} (e.g., /16): `).trim();
    const text = raw.startsWith('/') ? raw.slice(1) : raw;
    if (/^\d+$/.test(text)) {
      const value = parseInt(text, 10);
      if (value >= MIN_CIDR && value <= MAX_CIDR) {
        return value;
      }
    }
    console.log(`  Invalid input. Enter a whole number from /${MIN_CIDR} to /${MAX_CIDR}.`);
  }
}

// Whole number greater than 0.
function askPositiveInteger(prompt) {
  while (true) {
    const raw = readlineSync.question(prompt).trim();
    if (/^\d+$/.test(raw)) {
      const value = parseInt(raw, 10);
      if (Number.isSafeInteger(value) && value > 0) {
        return value;
      }
    }
    console.log('  Invalid input. Enter a whole number greater than 0.');
  }
}

// Dollar amount greater than 0. Accepts "1500", "1,500", "$1500", "1500.50".
function askBudget(prompt) {
  while (true) {
    const raw = readlineSync.question(prompt).trim().replace(/[$,]/g, '');
    if (/^\d+(\.\d{1,2})?$/.test(raw)) {
      const value = parseFloat(raw);
      if (value > 0) {
        return value;
      }
    }
    console.log('  Invalid input. Enter a dollar amount greater than 0 (for example 1500).');
  }
}

// Text that cannot be blank.
function askNonEmpty(prompt) {
  while (true) {
    const raw = readlineSync.question(prompt).trim();
    if (raw.length > 0) {
      return raw;
    }
    console.log('  Invalid input. This cannot be blank.');
  }
}

// yes/no (also accepts y/n, any capitalization). Returns true for yes.
function askYesNo(prompt) {
  while (true) {
    const raw = readlineSync.question(prompt).trim().toLowerCase();
    if (raw === 'yes' || raw === 'y') return true;
    if (raw === 'no' || raw === 'n') return false;
    console.log('  Invalid input. Please answer yes or no.');
  }
}

function formatMoney(amount) {
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

// ---------------------------------------------------------------------------
// Part A - Subnet Host Checker
// ---------------------------------------------------------------------------

function runSubnetChecker() {
  console.log('\n--- Subnet Host Checker ---');

  const vpcCidr = askCidr('Enter the VPC CIDR');
  const subnetCidr = askCidr('Enter the subnet CIDR');
  const devices = askPositiveInteger('Enter the number of devices required: ');

  // A subnet fits inside the VPC only if its prefix is the same as or longer
  // than the VPC's prefix (a bigger number means a smaller network).
  const consistent = subnetCidr >= vpcCidr;

  const totalIps = Math.pow(2, 32 - subnetCidr);
  const usableIps = Math.max(0, totalIps - AWS_RESERVED_IPS);
  const sufficient = devices <= usableIps;

  console.log('\nResults');
  console.log('-------');
  console.log(`VPC CIDR:    /${vpcCidr}`);
  console.log(`Subnet CIDR: /${subnetCidr}`);
  console.log(`Devices:     ${devices}`);
  console.log(`Subnet size: ${totalIps} total addresses, ${AWS_RESERVED_IPS} reserved by AWS, ${usableIps} usable`);

  if (consistent) {
    const subnetsThatFit = Math.pow(2, subnetCidr - vpcCidr);
    console.log(`\nCIDR consistency: CONSISTENT. A /${subnetCidr} subnet fits inside a /${vpcCidr} VPC ` +
      `(the VPC can hold ${subnetsThatFit} subnet(s) of this size).`);
  } else {
    console.log(`\nCIDR consistency: NOT CONSISTENT. A /${subnetCidr} subnet is larger than the /${vpcCidr} VPC, ` +
      `so it cannot fit inside it. The subnet CIDR must be /${vpcCidr} or higher.`);
  }

  if (sufficient) {
    console.log(`Capacity: SUFFICIENT for ${devices} device(s).`);
    console.log(`Unused IP addresses: ${usableIps - devices}`);
  } else {
    console.log(`Capacity: NOT SUFFICIENT for ${devices} device(s).`);
    console.log(`Additional IP addresses needed: ${devices - usableIps}`);
  }

  if (!consistent) {
    console.log('Note: the capacity figures above are for reference only, because this subnet cannot exist inside the VPC.');
  }
}

// Part B (Compute Environment Selector) is not built yet - coming in the next commit.
function runComputeSelector() {
  console.log('\n--- Compute Environment Selector ---');
  console.log('This tool has not been implemented yet.');
}

// ---------------------------------------------------------------------------
// Main menu (loops until the user chooses to exit)
// ---------------------------------------------------------------------------

function main() {
  console.log('=== Infrastructure Decision Tool ===');

  let running = true;
  while (running) {
    console.log('\nWhat would you like to do?');
    console.log('  1) Subnet Host Checker');
    console.log('  2) Compute Environment Selector');
    console.log('  3) Exit');

    const choice = readlineSync.question('Enter 1, 2, or 3: ').trim();

    if (choice === '1') {
      runSubnetChecker();
      running = askYesNo('\nWould you like to run another tool? (yes/no): ');
    } else if (choice === '2') {
      runComputeSelector();
      running = askYesNo('\nWould you like to run another tool? (yes/no): ');
    } else if (choice === '3') {
      running = false;
    } else {
      console.log('  Invalid choice. Please enter 1, 2, or 3.');
    }
  }

  console.log('\nGoodbye.');
}

main();
