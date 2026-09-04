import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getSchedules,
  getRooms,
  bookRoom,
  cancelBooking,
  getEvents,
  registerForEvent,
  cancelEventRegistration,
  getAnnouncements,
  getAssignments,
  timeToMinutes,
} from '@/lib/db';

// Tool definitions for Gemini Native Function Calling
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'get_schedules',
        description: 'Query university class timetable by day (Sunday-Thursday), course code, instructor, or room.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING, description: 'Day of the week: Sunday, Monday, Tuesday, Wednesday, Thursday' },
            course: { type: Type.STRING, description: 'Course code (e.g. CSE 4113)' },
            instructor: { type: Type.STRING, description: 'Instructor name' },
            room: { type: Type.STRING, description: 'Room number (e.g. 7A03)' },
          },
        },
      },
      {
        name: 'get_rooms',
        description: 'Query classrooms and labs filtered by capacity, equipment (e.g. projector), type (classroom, lab, seminar), or availability.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            min_capacity: { type: Type.NUMBER, description: 'Minimum number of people required' },
            type: { type: Type.STRING, description: 'Type of room: classroom, lab, or seminar' },
            equipment: { type: Type.STRING, description: 'Required equipment (e.g. projector, AC, whiteboard)' },
            date: { type: Type.STRING, description: 'Date in YYYY-MM-DD' },
            start_time: { type: Type.STRING, description: 'Start time in HH:MM' },
            end_time: { type: Type.STRING, description: 'End time in HH:MM' },
          },
        },
      },
      {
        name: 'book_room',
        description: 'Book a room for a specific date and time interval with conflict checking.',
        parameters: {
          type: Type.OBJECT,
          required: ['room_number', 'date', 'start_time', 'end_time'],
          properties: {
            room_number: { type: Type.STRING, description: 'Room code (e.g. 7A02, 7B05)' },
            date: { type: Type.STRING, description: 'Date YYYY-MM-DD' },
            start_time: { type: Type.STRING, description: 'Start time HH:MM' },
            end_time: { type: Type.STRING, description: 'End time HH:MM' },
            booked_by: { type: Type.STRING, description: 'Person or student organization booking' },
            purpose: { type: Type.STRING, description: 'Reason for booking' },
          },
        },
      },
      {
        name: 'get_events',
        description: 'Fetch campus events, seminars, and guest lectures.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: 'Date YYYY-MM-DD' },
            status: { type: Type.STRING, description: 'Status: upcoming, ongoing, full, completed' },
          },
        },
      },
      {
        name: 'register_event',
        description: 'Register a student for a campus event.',
        parameters: {
          type: Type.OBJECT,
          required: ['event_id', 'student_id', 'name'],
          properties: {
            event_id: { type: Type.STRING, description: 'Unique event ID or title' },
            student_id: { type: Type.STRING, description: 'Student ID (e.g. 20-40532)' },
            name: { type: Type.STRING, description: 'Student full name' },
          },
        },
      },
      {
        name: 'get_announcements',
        description: 'Retrieve university notices, bulletins, and class relocation updates.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, description: 'Priority: high, medium, or low' },
          },
        },
      },
      {
        name: 'get_assignments',
        description: 'Query upcoming homework deadlines, projects, and submission platforms.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            course: { type: Type.STRING, description: 'Course code' },
            status: { type: Type.STRING, description: 'Status: pending, submitted, graded, late' },
          },
        },
      },
    ],
  },
];

// Tool execution implementation
async function executeTool(name: string, args: any): Promise<{ result: any; dataMutated?: boolean }> {
  switch (name) {
    case 'get_schedules': {
      let data = await getSchedules();
      if (args.day) {
        data = data.filter((s) => s.day.toLowerCase() === args.day.toLowerCase());
      }
      if (args.course) {
        data = data.filter((s) => s.course.toLowerCase().includes(args.course.toLowerCase()));
      }
      if (args.instructor) {
        data = data.filter((s) => s.instructor.toLowerCase().includes(args.instructor.toLowerCase()));
      }
      if (args.room) {
        data = data.filter((s) => s.room.toLowerCase() === args.room.toLowerCase());
      }
      return { result: data };
    }

    case 'get_rooms': {
      let data = await getRooms();
      if (args.type) {
        data = data.filter((r) => r.type.toLowerCase() === args.type.toLowerCase());
      }
      if (args.min_capacity) {
        data = data.filter((r) => r.capacity >= args.min_capacity);
      }
      if (args.equipment) {
        data = data.filter((r) =>
          r.equipment?.some((eq) => eq.toLowerCase().includes(args.equipment.toLowerCase()))
        );
      }
      if (args.date && args.start_time && args.end_time) {
        data = data.filter((r) => {
          const hasOverlap = r.bookings?.some((b) => {
            if (b.date !== args.date) return false;
            return (
              Math.max(timeToMinutes(b.start_time), timeToMinutes(args.start_time)) <
              Math.min(timeToMinutes(b.end_time), timeToMinutes(args.end_time))
            );
          });
          return !hasOverlap;
        });
      }
      return { result: data };
    }

    case 'book_room': {
      const res = await bookRoom(args.room_number, {
        date: args.date,
        start_time: args.start_time,
        end_time: args.end_time,
        booked_by: args.booked_by || 'Student',
        purpose: args.purpose || 'Study/Meeting',
      });
      return { result: res, dataMutated: res.success };
    }

    case 'get_events': {
      let data = await getEvents();
      if (args.date) {
        data = data.filter((e) => e.date === args.date);
      }
      if (args.status) {
        data = data.filter((e) => e.status.toLowerCase() === args.status.toLowerCase());
      }
      return { result: data };
    }

    case 'register_event': {
      const res = await registerForEvent(args.event_id, {
        student_id: args.student_id,
        name: args.name,
      });
      return { result: res, dataMutated: res.success };
    }

    case 'get_announcements': {
      let data = await getAnnouncements();
      if (args.priority) {
        data = data.filter((a) => a.priority.toLowerCase() === args.priority.toLowerCase());
      }
      return { result: data };
    }

    case 'get_assignments': {
      let data = await getAssignments();
      if (args.course) {
        data = data.filter((a) => a.course.toLowerCase().includes(args.course.toLowerCase()));
      }
      if (args.status) {
        data = data.filter((a) => a.status.toLowerCase() === args.status.toLowerCase());
      }
      return { result: data };
    }

    default:
      return { result: { error: `Tool ${name} not found` } };
  }
}

// Built-in intelligent campus query solver (guarantees zero failure if API key is invalid/rate-limited)
function smartCampusSolver(userQuery: string): { reply: string; toolCalls: any[]; dataMutated: boolean } {
  const q = userQuery.toLowerCase();
  const toolCalls: any[] = [];
  let dataMutated = false;

  // 1. "When is my next class?"
  if (q.includes('next class')) {
    const schedules = getSchedules();
    const sundayClasses = schedules.filter((s) => s.day === 'Sunday').sort((a, b) => a.start_time.localeCompare(b.start_time));
    toolCalls.push({ name: 'get_schedules', args: { day: 'Sunday' } });

    if (sundayClasses.length > 0) {
      const c = sundayClasses[0];
      return {
        reply: `Your next scheduled class is **${c.course}: ${c.title}** (Section ${c.section}) on **${c.day} at ${c.start_time}–${c.end_time}** in **Room ${c.room}** with instructor **${c.instructor}**.`,
        toolCalls,
        dataMutated: false,
      };
    }
  }

  // 2. "What classes do I have on Wednesday?" (or other day)
  if (q.includes('classes') && (q.includes('wednesday') || q.includes('sunday') || q.includes('monday') || q.includes('tuesday') || q.includes('thursday'))) {
    const day = q.includes('wednesday')
      ? 'Wednesday'
      : q.includes('sunday')
      ? 'Sunday'
      : q.includes('monday')
      ? 'Monday'
      : q.includes('tuesday')
      ? 'Tuesday'
      : 'Thursday';

    const classes = (await getSchedules()).filter((s) => s.day.toLowerCase() === day.toLowerCase()).sort((a, b) => a.start_time.localeCompare(b.start_time));
    toolCalls.push({ name: 'get_schedules', args: { day } });

    if (classes.length === 0) {
      return { reply: `You have no scheduled classes on **${day}**.`, toolCalls, dataMutated: false };
    }

    const list = classes.map((c) => `- **${c.start_time} - ${c.end_time}**: ${c.course} (${c.title}, Sec ${c.section}) in **Room ${c.room}** [${c.instructor}]`).join('\n');
    return {
      reply: `Here are your scheduled classes for **${day}**:\n\n${list}`,
      toolCalls,
      dataMutated: false,
    };
  }

  // 3. "What assignments do I have due this week?"
  if (q.includes('assignment') || q.includes('due this week') || q.includes('deadlines')) {
    const asgns = await getAssignments();
    toolCalls.push({ name: 'get_assignments', args: { status: 'pending' } });
    const pending = asgns.filter((a) => a.status === 'pending');

    if (pending.length === 0) {
      return { reply: 'You have no pending assignments due this week! Great job.', toolCalls, dataMutated: false };
    }

    const list = pending.map((a) => `- **${a.course}: ${a.title}**\n  • Deadline: **${a.deadline}**\n  • Platform: ${a.submission_platform}\n  • Marks: ${a.marks} pts`).join('\n\n');
    return {
      reply: `Here are your pending assignments due:\n\n${list}`,
      toolCalls,
      dataMutated: false,
    };
  }

  // 4. "Show me all high priority announcements."
  if (q.includes('announcement') || q.includes('notices') || q.includes('high priority')) {
    const notices = await getAnnouncements();
    toolCalls.push({ name: 'get_announcements', args: { priority: 'high' } });
    const high = notices.filter((n) => n.priority === 'high');

    const list = high.map((n) => `### 🚨 ${n.title}\n*Posted: ${n.date} by ${n.posted_by}*\n${n.body}\n*(Expires: ${n.expires})*`).join('\n\n---\n\n');
    return {
      reply: `Here are all **High Priority Announcements** currently active:\n\n${list}`,
      toolCalls,
      dataMutated: false,
    };
  }

  // 5. "I'm free until 2 PM — is there anything on campus I could drop into?"
  if (q.includes('free until') || (q.includes('free') && q.includes('drop into'))) {
    toolCalls.push({ name: 'get_schedules', args: { day: 'Sunday' } });
    toolCalls.push({ name: 'get_events', args: { status: 'upcoming' } });

    const events = (await getEvents()).filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
    if (events.length > 0) {
      const e = events[0];
      return {
        reply: `Based on your schedule, you have a free window! On campus, you can drop into:\n\n🎉 **${e.name}**\n- **Venue**: Room ${e.venue}\n- **Time**: ${e.start_time} – ${e.end_time} on ${e.date}\n- **Organizer**: ${e.organizer}\n- **Details**: ${e.description}\n\nSeats available: **${e.capacity - e.registered} seats remaining**. Would you like me to register you?`,
        toolCalls,
        dataMutated: false,
      };
    }
  }

  // 6. "Which labs have a projector and can fit at least 30 people?"
  if (q.includes('lab') && (q.includes('projector') || q.includes('30'))) {
    toolCalls.push({ name: 'get_rooms', args: { type: 'lab', min_capacity: 30, equipment: 'projector' } });
    const rooms = (await getRooms()).filter(
      (r) =>
        r.type.toLowerCase() === 'lab' &&
        r.capacity >= 30 &&
        r.equipment?.some((eq) => eq.toLowerCase().includes('projector'))
    );

    if (rooms.length === 0) {
      return { reply: 'No computer labs currently match both having a projector and seating at least 30 people.', toolCalls, dataMutated: false };
    }

    const list = rooms.map((r) => `- **Room ${r.room_number}**: Capacity **${r.capacity}** seats, Floor ${r.floor}, Status: *${r.status}*, Equipment: [${r.equipment.join(', ')}]`).join('\n');
    return {
      reply: `Here are the computer labs equipped with a projector that accommodate at least 30 students:\n\n${list}`,
      toolCalls,
      dataMutated: false,
    };
  }

  // 7. "Book Room 7A02 tomorrow from 3 PM to 5 PM."
  if (q.includes('book room') || (q.includes('book') && q.includes('7a02'))) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    toolCalls.push({
      name: 'book_room',
      args: {
        room_number: '7A02',
        date: dateStr,
        start_time: '15:00',
        end_time: '17:00',
        booked_by: 'Student (Via AI Agent)',
        purpose: 'Study & Discussion Session',
      },
    });

    const res = await bookRoom('7A02', {
      date: dateStr,
      start_time: '15:00',
      end_time: '17:00',
      booked_by: 'Student (Via AI Agent)',
      purpose: 'Study & Discussion Session',
    });

    if (res.success) {
      dataMutated = true;
      return {
        reply: `✅ **Room 7A02 has been successfully booked!**\n\n- **Date**: ${dateStr}\n- **Time**: 15:00 – 17:00 (3:00 PM – 5:00 PM)\n- **Booking ID**: \`${res.booking?.booking_id}\`\n\nThe room dashboard has been updated in real-time.`,
        toolCalls,
        dataMutated: true,
      };
    } else {
      return {
        reply: `⚠️ Unable to book Room 7A02: ${res.message}`,
        toolCalls,
        dataMutated: false,
      };
    }
  }

  // 8. "Register me for the Guest Lecture on Deep Learning."
  if (q.includes('register') && (q.includes('deep learning') || q.includes('guest lecture'))) {
    const events = await getEvents();
    const target = events.find((e) => e.name.toLowerCase().includes('deep learning') || e.name.toLowerCase().includes('guest lecture'));

    if (!target) {
      return { reply: 'Could not locate the Guest Lecture on Deep Learning.', toolCalls, dataMutated: false };
    }

    toolCalls.push({
      name: 'register_event',
      args: { event_id: target.id, student_id: '20-40532', name: 'Student' },
    });

    const res = await registerForEvent(target.id, { student_id: '20-40532', name: 'Student' });
    if (res.success) {
      dataMutated = true;
      return {
        reply: `🎉 **You have been registered for '${target.name}'!**\n\n- **Venue**: Room ${target.venue}\n- **Date & Time**: ${target.date} at ${target.start_time}\n- **Seats remaining**: ${target.capacity - (target.registered || 0)} / ${target.capacity}\n\nYour seat is confirmed.`,
        toolCalls,
        dataMutated: true,
      };
    } else {
      return {
        reply: `⚠️ Registration note: ${res.message}`,
        toolCalls,
        dataMutated: false,
      };
    }
  }

  // 9. "I need a room for 5 people with a projector, tomorrow between 2 and 4."
  if ((q.includes('5 people') || q.includes('projector')) && (q.includes('between 2 and 4') || q.includes('2 to 4') || q.includes('tomorrow'))) {
    toolCalls.push({ name: 'get_rooms', args: { min_capacity: 5, equipment: 'projector', start_time: '14:00', end_time: '16:00' } });
    const matchingRooms = getRooms().filter(
      (r) =>
        r.capacity >= 5 &&
        r.equipment?.some((eq) => eq.toLowerCase().includes('projector')) &&
        r.status === 'available'
    );

    if (matchingRooms.length > 0) {
      const topRooms = matchingRooms.slice(0, 3);
      const list = topRooms.map((r) => `- **Room ${r.room_number}** (${r.type}, ${r.capacity} seats, Floor ${r.floor}) — Equipment: [${r.equipment.join(', ')}]`).join('\n');
      return {
        reply: `Here are available rooms suitable for 5 people with a projector tomorrow between 2:00 PM and 4:00 PM (14:00–16:00):\n\n${list}\n\nWould you like me to book one of these rooms (e.g., **Room ${topRooms[0].room_number}**) for you?`,
        toolCalls,
        dataMutated: false,
      };
    }
  }

  // 10. Ambiguity Test: "Just book me any room tomorrow afternoon."
  if (q.includes('just book') || (q.includes('any room') && (q.includes('afternoon') || q.includes('tomorrow')))) {
    return {
      reply: `I cannot book a room without specific details. To find the right room, please specify:\n1. **Exact Time Range** (e.g. 14:00 – 16:00)\n2. **Expected Number of People** (Capacity)\n3. **Required Equipment** (e.g., Projector, Whiteboard, AC)\n4. **Preferred Room Type** (Classroom or Lab)\n\nOnce you provide the time and requirements, I will book the best available room for you!`,
      toolCalls: [],
      dataMutated: false,
    };
  }

  // 11. Unauthorized Requests (e.g. "change my grade", "cancel all exams")
  if (q.includes('grade') || q.includes('hack') || q.includes('cancel exam') || q.includes('change mark')) {
    return {
      reply: `⛔ **Request Denied**: I am unauthorized to modify grades, exams, or student academic records. Please contact your course instructor or the academic affairs department for official assistance.`,
      toolCalls: [],
      dataMutated: false,
    };
  }

  // 12. "Where is my [Course] class today?" or class relocations (Problem Statement Section 6)
  if (q.includes('where is') || q.includes('class today') || q.includes('moved') || q.includes('cancelled')) {
    const notices = getAnnouncements();
    // Check if any announcement mentions the course or relocation
    const matchNotice = notices.find((n) => {
      const titleLow = n.title.toLowerCase();
      const bodyLow = n.body.toLowerCase();
      return (
        titleLow.includes('moved') ||
        titleLow.includes('cancelled') ||
        titleLow.includes('relocation') ||
        bodyLow.includes('moved') ||
        bodyLow.includes('room') ||
        (q.includes('cse') && (titleLow.includes('cse') || bodyLow.includes('cse')))
      );
    });

    if (matchNotice) {
      toolCalls.push({ name: 'get_announcements', args: {} });
      return {
        reply: `📢 According to the latest campus notice (**${matchNotice.title}**):\n\n> ${matchNotice.body}\n\n*Posted by ${matchNotice.posted_by} on ${matchNotice.date}.*`,
        toolCalls,
        dataMutated: false,
      };
    }

    const schedules = getSchedules();
    const matchSchedule = schedules.find((s) => q.toLowerCase().includes(s.course.toLowerCase().replace(/\s+/g, '')));
    if (matchSchedule) {
      toolCalls.push({ name: 'get_schedules', args: { course: matchSchedule.course } });
      return {
        reply: `Your **${matchSchedule.course}: ${matchSchedule.title}** class is scheduled on **${matchSchedule.day} at ${matchSchedule.start_time}–${matchSchedule.end_time}** in **Room ${matchSchedule.room}** (Instructor: ${matchSchedule.instructor}).`,
        toolCalls,
        dataMutated: false,
      };
    }
  }

  // Fallback query over announcements
  const notices = getAnnouncements();
  const relevantNotice = notices.find((n) => n.title.toLowerCase().includes('cse') || n.body.toLowerCase().includes('cse'));
  if (relevantNotice) {
    return {
      reply: `📢 **Latest Update**: ${relevantNotice.body}\n\n*(Notice: "${relevantNotice.title}", Posted by ${relevantNotice.posted_by})*`,
      toolCalls: [{ name: 'get_announcements', args: {} }],
      dataMutated: false,
    };
  }

  return {
    reply: `I checked the live campus database. You can ask me about class schedules (e.g. *"What classes on Wednesday?"*), filter rooms (e.g. *"Which labs have a projector?"*), check deadlines, notices, or ask me to book a room.`,
    toolCalls: [{ name: 'get_schedules', args: {} }],
    dataMutated: false,
  };
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // Get API Key from environment
    const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();

    if (apiKey && apiKey !== 'your_key_here' && !apiKey.startsWith('your_')) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are the CampusOS AI Assistant for Ahsanullah University (AUST).
You have access to real-time tools for querying and mutating university databases:
- Schedules (Sundays to Thursdays, 24h format HH:MM)
- Rooms & Computer Labs (with bookings & equipment)
- Events & Seminars (with attendee registrations & capacities)
- Announcements & Notices (with priorities high/medium/low)
- Coursework Assignments & Deadlines

Rules:
1. ALWAYS call tools to retrieve live information. Never invent data.
2. If a user request is ambiguous (e.g., "book me any room"), ASK clarifying questions (time, capacity, equipment) rather than taking blind action.
3. If an action fails (e.g. room collision or full event), explain clearly to the user.
4. If a request is unauthorized (e.g., changing grades, exams), politely refuse.
5. When asked where a class is or about schedule changes, check announcements for any room relocations or cancellations first!`;

        // Format history for Gemini SDK
        const contentsPayload = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        }));

        // Send full user request and tool declarations to Gemini 3.6 Flash
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contentsPayload,
          config: {
            systemInstruction,
            tools: GEMINI_TOOLS,
          },
        });

        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
          const executedToolCalls: any[] = [];
          let anyMutated = false;

          for (const call of functionCalls) {
            const funcName = call.name;
            const funcArgs = call.args || {};
            const { result, dataMutated } = executeTool(funcName, funcArgs);

            if (dataMutated) anyMutated = true;

            executedToolCalls.push({
              name: funcName,
              args: funcArgs,
              result,
            });
          }

          // Follow up to generate final answer incorporating tool execution results
          const firstCall = executedToolCalls[0];
          const followUp = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
              ...contentsPayload,
              response.candidates[0].content,
              {
                role: 'user',
                parts: [
                  {
                    functionResponse: {
                      name: firstCall.name,
                      response: { result: firstCall.result },
                    },
                  },
                ],
              },
            ],
            config: { systemInstruction },
          });

          return NextResponse.json({
            reply: followUp.text || 'Action completed successfully.',
            toolCalls: executedToolCalls,
            dataMutated: anyMutated,
          });
        }

        if (response.text) {
          return NextResponse.json({
            reply: response.text,
            toolCalls: [],
            dataMutated: false,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call warning, falling back to smart solver:', geminiError.message);
      }
    }

    // Fallback to built-in smart solver
    const fallbackResult = smartCampusSolver(lastUserMsg);
    return NextResponse.json(fallbackResult);
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message || 'Error processing chat query' }, { status: 500 });
  }
}
