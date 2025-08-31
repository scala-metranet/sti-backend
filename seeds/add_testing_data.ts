import { Knex } from "knex";
import xid from "xid-js";
import argon2 from "argon2";

export async function seed(knex: Knex): Promise<void> {
  await knex("user").del();
  await knex("user_internship").del();
  await knex("internship").del();
  await knex("squad").del();
  await knex("company").del();

  const password: string = await argon2.hash("password");
  // roles
  //   const role_mentor = "ce08kddq0yzfb7mtskz2";
  //   const role_mentee = "ce08kddq0yzfb7mtskz3";
  //   // mentor
  //   const mentor_id = xid.next();
  //   const mentor_id2 = xid.next();
  //mentee
  //   const mentee_id1 = xid.next();
  //   const mentee_id2 = xid.next();
  //   const mentee_id3 = xid.next();
  //   const mentee_id4 = xid.next();
  //   const mentee_id5 = xid.next();
  //   //squad
  //   const squad_id = xid.next();
  //   //company
  //   const company_id = xid.next();
  //   //internship
  //   const internship_id = xid.next();
  //   //user internship
  //   const user_internship_id2 = xid.next();
  //   const user_internship_id3 = xid.next();
  //   const user_internship_id4 = xid.next();
  //   const user_internship_id5 = xid.next();

  // Inserts Squad
  await knex("user").insert([
    {
      id: xid.next(),
      name: "Super Admin",
      email: "superadmin@gmail.com",
      password,
      role_id: "ce08kddq0yzfb7mtskz0",
      status: "active",
    },
    // {
    //   id: xid.next(),
    //   name: "Admin",
    //   email: "admin@gmail.com",
    //   password,
    //   role_id: "ce08kddq0yzfb7mtskz1",
    //   status: "active",
    // },
    // {
    //   id: xid.next(),
    //   name: "Mentor 1",
    //   email: "mentor@gmail.com",
    //   password,
    //   role_id: "ce08kddq0yzfb7mtskz2",
    // },
    // {
    //   id: xid.next(),
    //   name: "Mentee 1",
    //   email: "mentee@gmail.com",
    //   password,
    //   role_id: "ce08kddq0yzfb7mtskz3",
    // },
    // {
    //   id: mentor_id,
    //   name: "Mentor Testing 1",
    //   email: "mentortest1@gmail.com",
    //   password,
    //   role_id: role_mentor,
    //   status: "active",
    // },
    // {
    //   id: mentor_id2,
    //   name: "Mentor Testing 2",
    //   email: "mentortest2@gmail.com",
    //   password,
    //   role_id: role_mentor,
    //   status: "active",
    // },
  ]);

  //  await knex('squad').insert([
  //     { id: squad_id, name: 'Squad Testing', color: '#e11c48', mentor_id: mentor_id},
  // ]);

  // Inserts seed entries
  //   await knex("user").insert([
  //     {
  //       id: mentee_id1,
  //       name: "Mentee Testing 1",
  //       email: "menteetest1@gmail.com",
  //       password,
  //       role_id: role_mentee,
  //       status: "active",
  //     },
  //     {
  //       id: mentee_id2,
  //       name: "Mentee Testing 2",
  //       email: "menteetest2@gmail.com",
  //       password,
  //       role_id: role_mentee,
  //       status: "active",
  //       squad_id: squad_id,
  //     },
  //     {
  //       id: mentee_id3,
  //       name: "Mentee Testing 3",
  //       email: "menteetest3@gmail.com",
  //       password,
  //       role_id: role_mentee,
  //       status: "active",
  //       squad_id: squad_id,
  //     },
  //     {
  //       id: mentee_id4,
  //       name: "Mentee Testing 4",
  //       email: "menteetest4@gmail.com",
  //       password,
  //       role_id: role_mentee,
  //       status: "active",
  //     },
  //     {
  //       id: mentee_id5,
  //       name: "Mentee Testing 5",
  //       email: "menteetest5@gmail.com",
  //       password,
  //       role_id: role_mentee,
  //       status: "active",
  //     },
  //   ]);

  //   // Insert Company
  //   await knex("company").insert([
  //     {
  //       id: company_id,
  //       name: "Telkom",
  //       cfu: "-",
  //       department: "-",
  //       unit: "-",
  //       description: "-",
  //       logo: "-",
  //       type: "-",
  //       address: "-",
  //     },
  //   ]);

  //   // Inserts Internship
  //   await knex("internship").insert([
  //     {
  //       id: internship_id,
  //       name: "Internship Testing",
  //       mentor_id: mentor_id,
  //       description: "OH YEAH",
  //       company_id: company_id,
  //       program_id: "ce845hyhg5t0awb32jp0",
  //       period_start: "2022-12-01",
  //       period_end: "2023-02-01",
  //       type: "WFH",
  //       position: "Fullstack Developer",
  //       competence: "OH YEAH",
  //       criteria: "OH Yeah",
  //       requirements: "OH YEAH",
  //     },
  //   ]);

  //   // Inserts Internship
  //   await knex("user_internship").insert([
  //     {
  //       id: user_internship_id2,
  //       mentee_id: mentee_id2,
  //       internship_id: internship_id,
  //       strength: "",
  //       weakness: "",
  //       review: 0,
  //       information_source: "",
  //     },
  //     {
  //       id: user_internship_id3,
  //       mentee_id: mentee_id3,
  //       internship_id: internship_id,
  //       strength: "",
  //       weakness: "",
  //       review: 0,
  //       information_source: "",
  //     },
  //     {
  //       id: user_internship_id4,
  //       mentee_id: mentee_id4,
  //       internship_id: internship_id,
  //       strength: "",
  //       weakness: "",
  //       review: 0,
  //       information_source: "",
  //     },
  //     {
  //       id: user_internship_id5,
  //       mentee_id: mentee_id5,
  //       internship_id: internship_id,
  //       strength: "",
  //       weakness: "",
  //       review: 0,
  //       information_source: "",
  //     },
  //   ]);
}
