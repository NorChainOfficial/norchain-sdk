import SwiftUI
import Supabase

/// Test view for Supabase integration
/// This view helps verify that Supabase is working correctly
struct SupabaseTestView: View {
    @StateObject private var supabaseService = SupabaseService.shared
    @State private var email = ""
    @State private var password = ""
    @State private var testMessage = ""
    @State private var isLoading = false
    @State private var accounts: [SupabaseAccount] = []
    @State private var devices: [Device] = []
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("Supabase Integration Test")
                        .font(.title)
                        .bold()
                    
                    Text("Verify Supabase connection and test features")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 20)
                
                // Connection Status
                VStack(alignment: .leading, spacing: 12) {
                    Text("Connection Status")
                        .font(.headline)
                    
                    HStack {
                        Circle()
                            .fill(supabaseService.isAuthenticated ? Color.green : Color.gray)
                            .frame(width: 12, height: 12)
                        
                        Text(supabaseService.isAuthenticated ? "Connected & Authenticated" : "Not Authenticated")
                            .font(.subheadline)
                    }
                    
                    if let session = supabaseService.currentSession {
                        Text("User ID: \(session.user.id.uuidString)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Authentication Section
                if !supabaseService.isAuthenticated {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Authentication")
                            .font(.headline)
                        
                        TextField("Email", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
                        
                        SecureField("Password", text: $password)
                            .textFieldStyle(.roundedBorder)
                        
                        HStack(spacing: 12) {
                            Button(action: signUp) {
                                Text("Sign Up")
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                            .disabled(isLoading || email.isEmpty || password.isEmpty)
                            
                            Button(action: signIn) {
                                Text("Sign In")
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                            .disabled(isLoading || email.isEmpty || password.isEmpty)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                } else {
                    // Sign Out Button
                    Button(action: signOut) {
                        Text("Sign Out")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .padding(.horizontal)
                }
                
                // Test Actions (when authenticated)
                if supabaseService.isAuthenticated {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Test Actions")
                            .font(.headline)
                        
                        Button(action: testDeviceRegistration) {
                            HStack {
                                Text("Test Device Registration")
                                Spacer()
                                if isLoading {
                                    ProgressView()
                                }
                            }
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(8)
                        }
                        .disabled(isLoading)
                        
                        Button(action: testAccountCreation) {
                            HStack {
                                Text("Test Account Creation")
                                Spacer()
                                if isLoading {
                                    ProgressView()
                                }
                            }
                            .padding()
                            .background(Color.green.opacity(0.1))
                            .foregroundColor(.green)
                            .cornerRadius(8)
                        }
                        .disabled(isLoading)
                        
                        Button(action: fetchAccounts) {
                            HStack {
                                Text("Fetch Accounts")
                                Spacer()
                                if isLoading {
                                    ProgressView()
                                }
                            }
                            .padding()
                            .background(Color.purple.opacity(0.1))
                            .foregroundColor(.purple)
                            .cornerRadius(8)
                        }
                        .disabled(isLoading)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Results
                    if !testMessage.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Test Results")
                                .font(.headline)
                            
                            Text(testMessage)
                                .font(.caption)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color(.systemBackground))
                                .cornerRadius(8)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    
                    // Accounts List
                    if !accounts.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Synced Accounts (\(accounts.count))")
                                .font(.headline)
                            
                                ForEach(accounts) { account in
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(account.address)
                                            .font(.caption)
                                            .bold()
                                        Text("Chain: \(account.chain) • Type: \(account.type)")
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                    .padding(8)
                                    .background(Color(.systemBackground))
                                    .cornerRadius(6)
                                }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Supabase Test")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // MARK: - Actions
    
    private func signUp() {
        isLoading = true
        testMessage = ""
        
        Task {
            do {
                let session = try await supabaseService.signUp(
                    email: email,
                    password: password
                )
                await MainActor.run {
                    testMessage = "✅ Sign up successful!\nUser ID: \(session.user.id.uuidString)"
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    testMessage = "❌ Sign up failed: \(error.localizedDescription)"
                    isLoading = false
                }
            }
        }
    }
    
    private func signIn() {
        isLoading = true
        testMessage = ""
        
        Task {
            do {
                let session = try await supabaseService.signIn(
                    email: email,
                    password: password
                )
                await MainActor.run {
                    testMessage = "✅ Sign in successful!\nUser ID: \(session.user.id.uuidString)"
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    testMessage = "❌ Sign in failed: \(error.localizedDescription)"
                    isLoading = false
                }
            }
        }
    }
    
    private func signOut() {
        Task {
            do {
                try await supabaseService.signOut()
                await MainActor.run {
                    testMessage = "✅ Signed out"
                    accounts = []
                    devices = []
                }
            } catch {
                await MainActor.run {
                    testMessage = "❌ Sign out failed: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func testDeviceRegistration() {
        isLoading = true
        testMessage = ""
        
        Task {
            do {
                let device = try await supabaseService.registerDevice(
                    platform: "ios",
                    label: UIDevice.current.name,
                    pushToken: nil
                )
                await MainActor.run {
                    testMessage = "✅ Device registered!\nDevice ID: \(device.id.uuidString)"
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    testMessage = "❌ Device registration failed: \(error.localizedDescription)"
                    isLoading = false
                }
            }
        }
    }
    
    private func testAccountCreation() {
        isLoading = true
        testMessage = ""
        
        Task {
            do {
                // Create a test account
                let testAddress = "0x" + String((0..<40).map { _ in "0123456789abcdef".randomElement()! })
                
                let account = try await supabaseService.createAccount(
                    chain: "xaheen",
                    address: testAddress,
                    type: "EOA",
                    isDefault: false
                )
                await MainActor.run {
                    testMessage = "✅ Account created!\nAccount ID: \(account.id.uuidString)\nAddress: \(account.address)"
                    isLoading = false
                    fetchAccounts() // Refresh list
                }
            } catch {
                await MainActor.run {
                    testMessage = "❌ Account creation failed: \(error.localizedDescription)"
                    isLoading = false
                }
            }
        }
    }
    
    private func fetchAccounts() {
        isLoading = true
        
        Task {
            do {
                let fetchedAccounts = try await supabaseService.fetchAccounts()
                await MainActor.run {
                    accounts = fetchedAccounts
                    testMessage = "✅ Fetched \(fetchedAccounts.count) account(s)"
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    testMessage = "❌ Fetch failed: \(error.localizedDescription)"
                    isLoading = false
                }
            }
        }
    }
}

#if DEBUG
struct SupabaseTestView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SupabaseTestView()
        }
    }
}
#endif

