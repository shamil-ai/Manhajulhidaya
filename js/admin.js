// Admin Login Check
        (function verifyAccess() {
            const auth = sessionStorage.getItem("adminLoggedIn");
            if (!auth) {
                const password = prompt("Enter Admin Secret Key to access Console:");
                if (password === "admin123") {
                    sessionStorage.setItem("adminLoggedIn", "true");
                } else {
                    alert("Unauthorized Access!");
                    window.location.href = "index.html";
                }
            }
        })();

        let studentsList = [];
        let contactList = [];

        // Load all data
        function loadAllData() {
            studentsList = JSON.parse(localStorage.getItem("allRegisteredStudents") || "[]");
            contactList = JSON.parse(localStorage.getItem("contactMessages") || "[]");
            
            document.getElementById("totalCount").innerText = studentsList.length;
            document.getElementById("msgCount").innerText = contactList.length;

            renderStudentTable(studentsList);
            renderMessageTable(contactList);
        }

        // ================= ADMISSIONS FUNCTIONS =================
        function renderStudentTable(data) {
            const tbody = document.getElementById("studentTableBody");
            tbody.innerHTML = "";
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No registration entries found.</td></tr>`;
                return;
            }
            data.forEach((st, index) => {
                tbody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><img src="${st.photo || 'main/main/logo.png'}" class="student-img-thumb" onerror="this.src='https://via.placeholder.com/40'"></td>
                        <td><span class="badge badge-light border font-weight-bold">${st.regNo || '-'}</span></td>
                        <td><strong>${st.name || '-'}</strong></td>
                        <td>${st.course || '-'}</td>
                        <td>${st.phone || '-'}</td>
                        <td>${st.email || '-'}</td>
                        <td class="text-center">
                            <button class="btn btn-xs btn-info py-1 px-2" onclick="viewDetails('${st.email}')"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-xs btn-danger py-1 px-2" onclick="deleteRecord('admissions', '${st.email}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        }

        function filterStudents() {
            const q = document.getElementById("searchInput").value.toLowerCase();
            const filtered = studentsList.filter(s => 
                (s.name && s.name.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q)) || (s.regNo && s.regNo.toLowerCase().includes(q))
            );
            renderStudentTable(filtered);
        }

        function viewDetails(email) {
            const st = studentsList.find(s => s.email === email);
            if (!st) return;
            document.getElementById("modalStudentName").innerText = st.name;
            document.getElementById("modalContent").innerHTML = `
                <img src="${st.photo || 'main/main/logo.png'}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 3px solid #059669;">
                <div class="text-left mt-2 px-3">
                    <p><strong>Reg ID:</strong> ${st.regNo || '-'}</p>
                    <p><strong>Class:</strong> ${st.course || '-'}</p>
                    <p><strong>Father:</strong> ${st.fatherName || '-'}</p>
                    <p><strong>Mother:</strong> ${st.motherName || '-'}</p>
                    <p><strong>Phone:</strong> ${st.phone || '-'}</p>
                    <p><strong>Email:</strong> ${st.email || '-'}</p>
                    <p><strong>Password:</strong> <code style="color: #ef4444;">${st.password || '-'}</code></p>
                </div>`;
            $('#studentModal').modal('show');
        }

        // ================= CONTACT MESSAGES FUNCTIONS =================
        function renderMessageTable(data) {
            const tbody = document.getElementById("messageTableBody");
            tbody.innerHTML = "";
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No messages received yet.</td></tr>`;
                return;
            }
            // Show newest messages first
            [...data].reverse().forEach((msg, index) => {
                tbody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td style="font-size:12px;">${msg.date || '-'}</td>
                        <td><strong>${msg.name || '-'}</strong></td>
                        <td>${msg.phone || '-'} <br><small>${msg.email || ''}</small></td>
                        <td>${msg.subject || '-'}</td>
                        <td><span class="msg-preview text-muted">${msg.message || '-'}</span></td>
                        <td class="text-center">
                            <button class="btn btn-xs btn-primary py-1 px-2" onclick="viewMsgDetails('${msg.id}')"><i class="fas fa-book-open"></i></button>
                            <button class="btn btn-xs btn-danger py-1 px-2" onclick="deleteRecord('contacts', '${msg.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        }

        function filterMessages() {
            const q = document.getElementById("searchMsgInput").value.toLowerCase();
            const filtered = contactList.filter(m => 
                (m.name && m.name.toLowerCase().includes(q)) || (m.subject && m.subject.toLowerCase().includes(q)) || (m.phone && m.phone.includes(q))
            );
            renderMessageTable(filtered);
        }

        function viewMsgDetails(id) {
            const msg = contactList.find(m => m.id === id);
            if (!msg) return;
            document.getElementById("modalMsgContent").innerHTML = `
                <div class="px-2 text-left">
                    <p><strong>From:</strong> ${msg.name || '-'}</p>
                    <p><strong>Contact:</strong> ${msg.phone || '-'} | ${msg.email || '-'}</p>
                    <p><strong>Date:</strong> ${msg.date || '-'}</p>
                    <p><strong>Subject:</strong> ${msg.subject || '-'}</p>
                    <hr>
                    <p class="mt-2 mb-1"><strong>Message:</strong></p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size:14px; white-space: pre-wrap;">${msg.message || '-'}</div>
                </div>`;
            $('#messageModal').modal('show');
        }

        // ================= COMMON FUNCTIONS =================
        function deleteRecord(type, identifier) {
            if (confirm("Are you sure you want to delete this record?")) {
                if (type === 'admissions') {
                    studentsList = studentsList.filter(s => s.email !== identifier);
                    localStorage.setItem("allRegisteredStudents", JSON.stringify(studentsList));
                } else if (type === 'contacts') {
                    contactList = contactList.filter(m => m.id !== identifier);
                    localStorage.setItem("contactMessages", JSON.stringify(contactList));
                }
                loadAllData();
            }
        }

        function clearData(type) {
            if (confirm(`WARNING: Are you sure you want to clear ALL ${type} data?`)) {
                if (type === 'admissions') localStorage.removeItem("allRegisteredStudents");
                if (type === 'contacts') localStorage.removeItem("contactMessages");
                loadAllData();
            }
        }

        function exportToCSV(type) {
            let data = [], headers = [], filename = "";
            
            if (type === 'admissions') {
                if (studentsList.length === 0) return alert("No admissions to export.");
                headers = ["Reg ID", "Name", "Class", "Phone", "Email", "Father", "Mother"];
                data = studentsList.map(s => [`"${s.regNo||''}"`, `"${s.name||''}"`, `"${s.course||''}"`, `"${s.phone||''}"`, `"${s.email||''}"`, `"${s.fatherName||''}"`, `"${s.motherName||''}"`]);
                filename = "Manhajul_Admissions.csv";
            } else {
                if (contactList.length === 0) return alert("No messages to export.");
                headers = ["Date", "Name", "Phone", "Email", "Subject", "Message"];
                data = contactList.map(m => [`"${m.date||''}"`, `"${m.name||''}"`, `"${m.phone||''}"`, `"${m.email||''}"`, `"${m.subject||''}"`, `"${(m.message||'').replace(/"/g, '""')}"`]);
                filename = "Manhajul_Messages.csv";
            }

            let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...data.map(e => e.join(","))].join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function lockAdmin() {
            sessionStorage.removeItem("adminLoggedIn");
            window.location.href = "index.html";
        }

        loadAllData();