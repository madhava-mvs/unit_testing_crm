"use strict";

var mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
});

con.connect(async function (err){
  if (err) throw err;
  console.log("connected!");
});


const jwt = require("jsonwebtoken");

module.exports.login1 = async (event) => {
  let req = event.body;
  if (req.username == "") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "error",
        Message: "username missing",
      }),
    };
  } else if (req.password == "") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "error",
        Message: "password missing",
      }),
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "success",
        Message: "Successfully Done!",
      }),
    };
  }
};

module.exports.login = async (event) => {
  let request = JSON.parse(event.body);
  let username = request.username;
  let password = request.password;
  let sql =
    "SELECT id, txtFirstName, txtPhonenumber FROM crm.tblusers where txtEmail='" +
    username +
    "' and txtPassword='" +
    password +
    "';";
  let prom = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      if (result != "") {
        const token = jwt.sign(
          { username: username, password: password },
          "secretkey"
        );
        resolve({ body: JSON.stringify(token) });
      } else {
        reject("incorrect email or password");
      }
    });
  });

  return prom;

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.middleware = async (event, context) => {
  console.log("middleware");
  let token = event.headers.token;
  let verified = await new Promise((resolve, reject) => {
    jwt.verify(token, "secretkey", (err, decoded) => {
      if (err) resolve(false);
      resolve(true);
    });
  });
  if (!verified) {
    context.end();
    return { statusCode: 403, body: "Authentication Failed!" };
  }
};

module.exports.Verifyotp = async (event) => {
  let request = JSON.parse(event.body);
  let otp = request.enteredotp;
  let email = request.email;
  let sqlverify =
    "select id from crm.tblusers where txtOTP = '" +
    otp +
    "' and txtEmail = '" +
    email +
    "';";
  let prom = await new Promise((resolve, reject) => {
    con.query(sqlverify, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result == "") {
        reject("wrong otp");
      } else {
        resolve("your verified");
      }
    });
  });
  return prom;
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.insertsingleprofile = async (event) => {
  let request = JSON.parse(event.body);
  let firstname = request.firstname;
  let email = request.email;
  let password = request.password;
  let phone = request.phone;
  let sql =
    "select txtemail from crm.tblusers where txtEmail =  '" + email + "';";
  let sql1 =
    "insert into crm.dbdata(txtfirstname, txtemail, txtpassword, txtphone) values ('" +
    firstname +
    "','" +
    email +
    "','" +
    password +
    "', '" +
    phone +
    "');";
  let prom = await new Promise((resolve, reject) => {
    if (firstname == "") {
      reject("Firstname is empty");
    } else if (email == "") {
      reject("Email is empty");
    } else if (password == "") {
      reject("Password is empty");
    } else if (phone == "") {
      reject("phone is empty");
    } else {
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Result = " + JSON.stringify(result));
        if (result != "") {
          reject("Profile already exists!");
        } else {
          con.query(sql1, function (err, result) {
            if (err) throw err;
            resolve("Profile Inserted!");
            console.log("New user profile details inserted");
          });
        }
      });
    }
  });
  return prom;
};

module.exports.getsingleprofile = async (event) => {
  let request = JSON.parse(event.body);
  let id = request.id;
  let sql =
    "select txtFirstName, txtLastName, txtEmail from crm.tblusers where id = '" +
    id +
    "';";
  let prom = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Profile information displayed");
      if (result != "") {
        resolve({ body: "Profile Information: " + JSON.stringify(result) });
      } else {
        reject("Profile does not exist");
      }
    });
  });
  return prom;
};

module.exports.UpdateSingleProfile = async (event) => {
  let request = JSON.parse(event.body);
  let id = request.id;
  let sqlget = "select * from crm.tblusers where id = " + id + ";";
  let firstname;
  let email;
  let password;
  let phoneno;
  let firstname1 = request.firstname;
  let email1 = request.email;
  let password1 = request.password;
  let phoneno1 = request.phone;
  let prom = await new Promise((resolve, reject) => {
    con.query(sqlget, function (err, result) {
      if (err) throw err;
      console.log(result);
      firstname = result.txtFirstName;
      email = result.txtEmail;
      password = result.txtPassword;
      phoneno = result.txtPhonenumber;
      // resolve({body: JSON.stringify(result)})
      if (firstname1 == "") {
        reject("firstname is mandatory");
      } else if (email1 == "") {
        reject("email is mandatory");
      } else if (password1 == "") {
        reject("password is mandatory");
      } else if (phoneno1 == "") {
        reject("phone number is mandatory");
      } else {
        firstname = firstname1;
        email = email1;
        password = password1;
        phoneno = phoneno1;
        let sqlupdate =
          "update crm.tblusers set txtFirstName = '" +
          firstname +
          "', txtEmail = '" +
          email +
          "', txtPassword = '" +
          password +
          "', txtPhonenumber = '" +
          phoneno +
          "' where id = " +
          id +
          ";";
        con.query(sqlupdate, function (err, result) {
          if (err) throw err;
          console.log(result);
          resolve("your data is updated");
        });
      }
    });
  });
  return prom;
};

module.exports.GetSingleCampaign = async (event) => {
  let request = JSON.parse(event.body);
  let CampaignName = request.CampaignName;
  let sqlSinglecampaign =
    "SELECT txtCampaignName CampaignName,dtStartdate Startdate,dtEnddate Enddate ,Status1, count(txtCampaignName) NoOfOwners FROM tblcampaign join tblusers where txtCampaignName = '" +
    CampaignName +
    "' group by txtCampaignName;";
  let result = await new Promise((resolve, reject) => {
    con.query(sqlSinglecampaign, function (err, result) {
      if (err) throw err;
      console.log("Selected Campaign Details");
      if (result != "") {
        resolve({
          body:
            "Campaign details for selected Campaign" + JSON.stringify(result),
        });
        return;
      } else {
        reject("Campaign Does Not Exist");
        return;
      }
    });
  });
  return result;
};

module.exports.GetSingleLead = async (event) => {
  let request = JSON.parse(event.body);
  let LeadName = request.LeadName;
  let sqlSingleLead =
    "SELECT tl.txtFirstName FirstName,tl.txtLastName LastName,tl.status1 Status,tl.dtCreatedOn CreatedOn,tl.txtEmail Email,tl.Responses,tu.txtFirstName Owner FROM tblleads tl JOIN tblusers tu on tl.refCreatedBy=tu.id where tl.txtFirstName = '" +
    LeadName +
    "';";
  let result = await new Promise((resolve, reject) => {
    con.query(sqlSingleLead, function (err, result) {
      if (err) throw err;
      console.log("Selected Lead Details");
      if (result != "") {
        resolve({
          body: "Lead details for selected Lead" + JSON.stringify(result),
        });
        return;
      } else {
        reject("LeadName Does Not Exist");
        return;
      }
    });
  });
  return result;
};

module.exports.GetSingleTask = async (event) => {
  let request = JSON.parse(event.body);
  let TaskName = request.TaskName;
  let sql =
    "SELECT tt.txtActivitytype, tc.txtConversionType, count(tt.txtActivitytype) as count FROM tblactivity ta JOIN tblactivitytype tt ON ta.refActivitytype = tt.id JOIN tblconversiontype tc ON ta.refConversionStatus = tc.id where tt.txtActivitytype = '" +
    TaskName +
    "';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result !== "") {
        resolve({ body: "Selected Task Details" + JSON.stringify(result) });
        return;
      } else {
        reject(" Task does not Exist");
        return;
      }
    });
  });
  return result;
};

module.exports.campaignwiseprospectcount = async (event) => {
  let sql =
    "SELECT B.refCampaignId, A.txtCampaignName, D.txtConversionType, count(txtCampaignName) as count FROM tblcampaign A  JOIN tblleadcampaignmap B ON A.id = B.refCampaignId  JOIN  tblactivity C ON B.id = C.refMapid    JOIN  tblconversiontype D ON C.refConversionStatus = D.id  where D.txtConversionType = 'Prospect'  group by A.txtCampaignName;";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};

module.exports.ManagerwiseProspectCount = async (event) => {
  let sql =
    "SELECT B.txtFirstName, A.txtJobTitle, E.txtConversionType, COUNT(E.txtConversionType) FROM tbljobtitle A JOIN tblusers B ON A.id = B.refJobTitle JOIN tblleadcampaignmap C ON C.refCreatedBy = B.id JOIN tblactivity D ON D.refMapid = C.id JOIN tblconversiontype E ON D.refConversionStatus = E.id WHERE A.txtJobTitle = '% Manager' AND E.txtConversionType = 'Prospect';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};

module.exports.leadsfunnel = async (event) => {
  let sql =
    "select count(id) leadscount from crm.tblleads union all SELECT count(d.txtConversionType) as NoOfLeads FROM crm.tblleads a JOIN crm.tblleadcampaignmap b ON a.id = b.refLeadId JOIN crm.tblactivity c ON b.id = c.refMapid JOIN crm.tblconversiontype d ON c.refConversionStatus = d.id where d.txtConversionType = 'Nurturing ' or d.txtConversionType = 'Prospect ' group by d.txtConversionType;";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};
