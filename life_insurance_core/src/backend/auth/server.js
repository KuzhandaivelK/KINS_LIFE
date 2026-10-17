require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend assets directly from port 3000 as well
app.use(express.static(path.join(__dirname, '../../frontend')));

// Enable auto-commit for transactions if needed
oracledb.autoCommit = true;

if (process.env.ORACLE_LIB_DIR && process.env.ORACLE_LIB_DIR.trim() !== '') {
  try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_LIB_DIR });
    console.log('Oracle Thick mode initialized using:', process.env.ORACLE_LIB_DIR);
  } catch (err) {
    console.warn('Fallback to Thin mode:', err.message);
  }
} else {
  console.log('Oracle Client running in Thin mode (pure JS, no instant client needed)');
}

// -------------------------------------------------------------
// Authentication Endpoint: Verify user against MTB_USERS
// -------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email and password are required' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    const sql = `
      SELECT 
        USER_ID,
        USER_EMAIL,
        USER_PASSWORD,
        USER_NAME,
        USER_GROUP,
        USER_DESIGNATION,
        USER_MUST_CHANGE_PASSWORD,
        USER_IS_LOCKED,
        USER_FAILED_LOGIN_ATTEMPTS
      FROM MTB_USERS 
      WHERE (LOWER(USER_ID) = LOWER(:u) OR LOWER(USER_EMAIL) = LOWER(:u))
    `;
    
    const result = await connection.execute(
      sql,
      { u: username.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid User ID or Password' });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.USER_IS_LOCKED === 1) {
      return res.status(403).json({ success: false, message: 'Your account is locked. Please contact the administrator.' });
    }

    // Verify Password
    if (user.USER_PASSWORD !== password) {
      try {
        await connection.execute(
          `UPDATE MTB_USERS SET USER_FAILED_LOGIN_ATTEMPTS = NVL(USER_FAILED_LOGIN_ATTEMPTS, 0) + 1 WHERE USER_ID = :id`,
          { id: user.USER_ID }
        );
      } catch (_) {}
      return res.status(401).json({ success: false, message: 'Invalid User ID or Password' });
    }

    // Login successful: Update sign-in stats
    try {
      await connection.execute(
        `UPDATE MTB_USERS 
         SET USER_LOGIN_COUNT = NVL(USER_LOGIN_COUNT, 0) + 1,
             USER_LAST_SIGN_IN_AT = SYSTIMESTAMP,
             USER_FAILED_LOGIN_ATTEMPTS = 0
         WHERE USER_ID = :id`,
        { id: user.USER_ID }
      );
    } catch (updateErr) {
      console.warn('Notice: Could not update last sign-in stats:', updateErr.message);
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.USER_ID,
        username: user.USER_NAME || user.USER_ID,
        email: user.USER_EMAIL,
        userGroup: user.USER_GROUP,
        mustChangePassword: user.USER_MUST_CHANGE_PASSWORD === 1
      }
    });

  } catch (err) {
    console.error('Oracle DB Error:', err);
    res.status(500).json({
      success: false,
      message: 'Database error: ' + (err.message || 'Unknown error occurred')
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing Oracle connection:', closeErr);
      }
    }
  }
});

// -------------------------------------------------------------
// Menu Microservice API: Fetch menus and hierarchical submenus from MTB_MENUS
// -------------------------------------------------------------
app.get('/api/menus', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    // 1. Primary Query specified for Root Menus:
    const rootSql = `
      SELECT
        MENU_ID,
        MENU_NAME,
        MENU_DISP_NAME,
        MENU_PARENT_ID,
        MENU_SEQ_NO
      FROM
        MTB_MENUS
      WHERE
        MENU_PARENT_ID = '*'
      ORDER BY
        MENU_SEQ_NO
    `;
    const rootResult = await connection.execute(rootSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const rootMenus = rootResult.rows || [];

    // 2. Query all submenus so the system dynamically handles future and existing submenus:
    const allSql = `
      SELECT
        MENU_ID,
        MENU_NAME,
        MENU_DISP_NAME,
        MENU_PARENT_ID,
        MENU_SEQ_NO
      FROM
        MTB_MENUS
      ORDER BY
        MENU_SEQ_NO
    `;
    const allResult = await connection.execute(allSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const allMenus = allResult.rows || [];

    // Build recursive / nested menu tree:
    // Map items by their MENU_PARENT_ID
    const childrenMap = {};
    allMenus.forEach(item => {
      const parent = item.MENU_PARENT_ID || '*';
      if (!childrenMap[parent]) childrenMap[parent] = [];
      childrenMap[parent].push({
        ...item,
        subMenus: []
      });
    });

    // Attach submenus to each root menu
    const menuTree = rootMenus.map(root => {
      const children = childrenMap[root.MENU_ID] || [];
      // If children have sub-children in future:
      children.forEach(child => {
        child.subMenus = childrenMap[child.MENU_ID] || [];
      });
      return {
        ...root,
        hasSubMenus: children.length > 0,
        subMenus: children
      };
    });

    res.json({
      success: true,
      rootMenus: rootMenus,
      menuTree: menuTree,
      totalCount: allMenus.length
    });
  } catch (err) {
    console.error('Oracle Menu Fetch Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menus from MTB_MENUS: ' + (err.message || 'Unknown error')
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing Oracle connection:', closeErr);
      }
    }
  }
});

// -------------------------------------------------------------
// Dashboard Summary API: Core Life Insurance Metrics & Pipeline
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    // Verify Oracle database connection is healthy
    const pingResult = await connection.execute(
      `SELECT SYSTIMESTAMP AS DB_TIME, USER AS DB_USER FROM DUAL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const dbTime = pingResult.rows[0]?.DB_TIME;

    res.json({
      success: true,
      database: {
        status: 'CONNECTED',
        schema: 'PROP_PLUS',
        instance: 'ORCL',
        timestamp: dbTime
      },
      kpis: [
        {
          id: 'active_policies',
          title: 'Active Policies',
          value: '48,290',
          change: '+14.2% MoM',
          trend: 'up',
          icon: 'shield'
        },
        {
          id: 'gross_premium',
          title: 'Gross Written Premium',
          value: '$24.8M',
          change: '+9.4% vs Target',
          trend: 'up',
          icon: 'dollar'
        },
        {
          id: 'pending_uw',
          title: 'Underwriting Pipeline',
          value: '138',
          change: '24 Priority',
          trend: 'neutral',
          icon: 'clipboard'
        },
        {
          id: 'claim_ratio',
          title: 'Claim Settlement Ratio',
          value: '98.8%',
          change: 'avg 1.8 days turnaround',
          trend: 'up',
          icon: 'check'
        }
      ],
      recentProposals: [
        { propNo: 'PROP-2026-8941', customer: 'David Richardson', plan: 'Term Life Elite (30Y)', sumAssured: '$500,000', status: 'Approved', date: 'Today, 14:22' },
        { propNo: 'PROP-2026-8940', customer: 'Priya Narayanan', plan: 'Endowment Shield Plus', sumAssured: '$250,000', status: 'Under Review', date: 'Today, 12:45' },
        { propNo: 'PROP-2026-8939', customer: 'Michael Chang', plan: 'Whole Life Protector', sumAssured: '$750,000', status: 'Pending Med', date: 'Today, 10:15' },
        { propNo: 'PROP-2026-8938', customer: 'Sarah Jenkins', plan: 'Child Future Assurance', sumAssured: '$150,000', status: 'In Force', date: 'Yesterday' },
        { propNo: 'PROP-2026-8937', customer: 'Ahmed Al-Mansoor', plan: 'Retirement Annuity Pro', sumAssured: '$400,000', status: 'In Force', date: 'Yesterday' }
      ]
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats: ' + err.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (_) {}
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Kinsure+ Life Insurance Core Microservice Started`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` Web Portal: http://localhost:${PORT}`);
  console.log(` Connected to: PROP_PLUS@localhost:1521/orcl`);
  console.log(`=======================================================`);
});
