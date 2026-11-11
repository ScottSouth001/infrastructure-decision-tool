INFRASTRUCTURE DECISION TOOL
INFO 300 - Programming Assignment
==============================================================

OVERVIEW
--------
A Node.js command-line program with two tools:

  1) Subnet Host Checker
  2) Compute Environment Selector

The program shows a menu at startup, runs the tool you choose, and then asks
whether you want to run another tool or exit. All input is validated, and
every prompt repeats until a valid answer is entered.


HOW TO RUN
----------
Requires Node.js. From the project folder:

    npm install
    node infrastructure_decision_tool.js

(npm install installs the readline-sync package listed in package.json.)


PART A - SUBNET HOST CHECKER
----------------------------
Prompts for the VPC CIDR, the subnet CIDR, and the number of devices.

Validation:
  - Both CIDR values must be a whole number from /16 to /30
    (typing "/24" or "24" both work).
  - Devices must be a positive whole number.

Output:
  - Whether the subnet CIDR is consistent with the VPC CIDR.
  - Whether the subnet has enough addresses for the devices.
  - The number of unused addresses, or the additional addresses needed.

How it works:
  - Total addresses in a subnet = 2 ^ (32 - subnet prefix).
  - AWS reserves 5 addresses per subnet, so usable = total - 5
    (never less than 0; a /30 has only 4 addresses, so 0 are usable).
  - "Consistent" means the subnet prefix is the same as or larger than the
    VPC prefix. For example, a /24 fits inside a /16, but a /16 does not
    fit inside a /24 (a smaller prefix number means a bigger network).
  - If the subnet is not consistent, the program still reports capacity but
    notes that those figures are for reference only.


EXAMPLE 1 - SUBNET IS SUFFICIENT
--------------------------------
Input:   VPC CIDR /16, subnet CIDR /24, 200 devices

Output:
    Subnet size: 256 total addresses, 5 reserved by AWS, 251 usable
    CIDR consistency: CONSISTENT. A /24 subnet fits inside a /16 VPC
    (the VPC can hold 256 subnet(s) of this size).
    Capacity: SUFFICIENT for 200 device(s).
    Unused IP addresses: 51


EXAMPLE 2 - SUBNET IS NOT SUFFICIENT
------------------------------------
Input:   VPC CIDR /16, subnet CIDR /28, 20 devices

Output:
    Subnet size: 16 total addresses, 5 reserved by AWS, 11 usable
    CIDR consistency: CONSISTENT. A /28 subnet fits inside a /16 VPC
    (the VPC can hold 4096 subnet(s) of this size).
    Capacity: NOT SUFFICIENT for 20 device(s).
    Additional IP addresses needed: 9


PART B - COMPUTE ENVIRONMENT SELECTOR
-------------------------------------
Prompts for the application name, monthly users, monthly budget, and
whether high availability (HA) is required.

Validation:
  - Application name cannot be blank.
  - Monthly users must be a positive whole number.
  - Budget must be a dollar amount greater than 0 ("1500", "1,500", and
    "$1500.50" are all accepted).
  - High availability must be yes or no (y/n also accepted).

Recommendation rules:
  - Fewer than 1,000 users and no HA      -> Single EC2
  - 1,000 to 10,000 users                 -> EC2 + Load Balancer
  - More than 10,000 users, or HA         -> EC2 + Load Balancer + Auto Scaling

Budget warnings:
  - Budget under $1,000: warns if the recommendation needs more than a
    single EC2.
  - Budget $1,000 to $3,000 (inclusive): warns if the recommendation needs
    Auto Scaling.
  - Budget over $3,000: no warning.

Assumption: when the rules overlap (for example, 500 users with HA), the
HA / more-than-10,000-users rule takes priority, so HA always results in
EC2 + Load Balancer + Auto Scaling.


EXAMPLE 3 - COMPUTE ENVIRONMENT
-------------------------------
Input:   App "Shop", 5000 users, $500 budget, no HA

Output:
    Recommended architecture: EC2 + Load Balancer
    WARNING: A budget under $1,000 may not cover "EC2 + Load Balancer".
    This architecture needs more than a single EC2 instance.
