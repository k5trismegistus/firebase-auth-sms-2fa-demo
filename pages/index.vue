<template>
  <div>
    <div v-show="state=='notLoggedIn'">
      <button @click="loginWithEmail">ログイン</button>
    </div>

    <div v-show="state=='onlyEmail'">
      <p>{{`email: ${auth.email}`}}</p>
      <h3>電話番号を入力</h3>
      <input v-model='phoneNumber' />
      <button id='linkPhoneNumberBtn' @click="sendSmsVerification">確認番号を送信</button>
    </div>
    
    <div v-show="state=='waitingVerify'">
      <p>{{`email: ${auth.email}`}}</p>
      <h3>確認番号を入力</h3>
      <input v-model='verificationCode' />
      <button @click="confirmVerification">確認</button>
    </div>

    <div v-show="state=='emailAndPhoneNumber'">
      <p>{{`email: ${auth.email}`}}</p>
      <p>{{`phone number: ${auth.phoneNumber}`}}</p>
    </div>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase-client'

export default {
  data() {
    return {
      auth: {
        email: '',
        phoneNumber: '',
      },
      phoneNumber: '',
      recaptchaVerifier: null,
      confirmationResult: null,
      waitingVerify: false,
      verificationCode: '',
      user: null
    } 
  },
  computed: {
    state() {
      if (!this.auth.email) {
        return 'notLoggedIn'
      }
      if (this.auth.email  && !this.waitingVerify && !this.auth.phoneNumber) {
        return 'onlyEmail'
      }
      if (this.auth.email && this.waitingVerify && !this.auth.phoneNumber) {
        return 'waitingVerify'
      }
      return 'emailAndPhoneNumber'
    },
  },
  async mounted() {
    const _this = this
    firebase.auth().getRedirectResult().then((result) => {
      if (result.credential) {
        const user = result.user
        _this.user = user
        if (user.email) {
          _this.auth.email = user.email
        }
      }
    })

    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('linkPhoneNumberBtn', {
      'size': 'invisible',
    })
  },
  methods: {
    loginWithEmail() {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
    },
    async sendSmsVerification() {
      try {
        const confirmationResult = await firebase.auth().signInWithPhoneNumber(this.phoneNumber, this.recaptchaVerifier)
        this.confirmationResult = confirmationResult
        this.waitingVerify = true
      } catch(error) {
        console.error(error)
      }
    },
    async confirmVerification() {
      const credential = firebase.auth.PhoneAuthProvider.credential(this.confirmationResult.verificationId, this.verificationCode)
      const userCred = await this.user.linkAndRetrieveDataWithCredential(credential)
      this.auth.phoneNumber = userCred.user.phoneNumber
    }
  }
}
</script>